from sqlite_discovery import discover_sqlite_dbs
from db_context import get_active_db_context, execute_query
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

from schema_extractor import schema
from prompt_builder import schema_to_prompt
from translator import translate_to_english
from sql_generator import generate_sql
from sql_validator import is_safe_sql
from sql_executor import execute_sql

from db_registry import (
    list_databases,
    add_database,
    set_active_database,
    get_active_database
)

app = FastAPI(title="SQL BUDDY")
templates = Jinja2Templates(directory="web")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],   # allows OPTIONS
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})



class QueryRequest(BaseModel):
    query: str

@app.post("/query")
def run_query(req: QueryRequest):
    # 1. Translate user query
    english_query = translate_to_english(req.query)

    # 2. Load active database context
    ctx = get_active_db_context()
    schema = ctx["schema"]

    # 3. Build schema prompt
    schema_prompt = schema_to_prompt(schema)

    # 4. Generate SQL
    sql = generate_sql(english_query, schema_prompt)

    # 5. Validate SQL
    if not is_safe_sql(sql):
        raise HTTPException(status_code=400, detail="Unsafe SQL detected")

    # 6. Execute SQL on active DB
    columns, rows = execute_query(ctx["url"], sql)

    return {
        "active_database": ctx["name"],
        "english_query": english_query,
        "sql": sql,
        "columns": list(columns),
        "rows": [list(row) for row in rows],
    }


@app.get("/databases")
def get_databases():
    dbs, active = list_databases()
    return {
        "active": active,
        "databases": dbs
    }


class AddDatabaseRequest(BaseModel):
    name: str
    type: str
    url: str


@app.post("/databases/add")
def add_db(req: AddDatabaseRequest):
    try:
        add_database(req.name, req.type, req.url)
        return {"status": "added"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


class SelectDatabaseRequest(BaseModel):
    name: str


@app.post("/databases/select")
def select_db(req: SelectDatabaseRequest):
    try:
        set_active_database(req.name)
        return {"status": "active database changed"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/databases/local/sqlite")
def list_local_sqlite():
    dbs = discover_sqlite_dbs("databases")
    return {"sqlite_databases": dbs}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
