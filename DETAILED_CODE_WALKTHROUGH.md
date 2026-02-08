# SQL Buddy - Detailed Code Walkthrough

## Complete Line-by-Line Explanation of Every Code Block

This document explains every single line of code in the SQL Buddy project.

---

## 1. APP.PY - Main Application

### Import Section

```python
from sqlite_discovery import discover_sqlite_dbs
```
**Explanation**: Imports function to scan directories for SQLite database files.

```python
from db_context import get_active_db_context, execute_query
```
**Explanation**: 
- `get_active_db_context`: Gets current database with its schema
- `execute_query`: Runs SQL queries against a database

```python
from fastapi import FastAPI, HTTPException, Request
```
**Explanation**:
- `FastAPI`: Main web framework class
- `HTTPException`: Used to return HTTP error responses
- `Request`: Represents incoming HTTP requests

```python
from fastapi.middleware.cors import CORSMiddleware
```
**Explanation**: Enables Cross-Origin Resource Sharing (allows frontend from different domain to call API)

```python
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
```
**Explanation**:
- `HTMLResponse`: Returns HTML content to browser
- `Jinja2Templates`: Template engine for rendering HTML files

```python
from pydantic import BaseModel
```
**Explanation**: BaseModel is used to define request/response data structures with automatic validation

```python
import uvicorn
```
**Explanation**: ASGI server that runs the FastAPI application

```python
from schema_extractor import schema
from prompt_builder import schema_to_prompt
from translator import translate_to_english
from sql_generator import generate_sql
from sql_validator import is_safe_sql
from sql_executor import execute_sql
```
**Explanation**: Imports all the pipeline functions for processing queries

```python
from db_registry import (
    list_databases,
    add_database,
    set_active_database,
    get_active_database
)
```
**Explanation**: Imports database management functions

### Application Setup

```python
app = FastAPI(title="SQL BUDDY")
```
**Explanation**: Creates FastAPI application instance with title "SQL BUDDY"

```python
templates = Jinja2Templates(directory="web")
```
**Explanation**: Configures template engine to look for HTML files in "web" folder

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
**Explanation**: Adds CORS middleware to allow requests from any origin
- `allow_origins=["*"]`: Accept requests from any domain
- `allow_credentials=True`: Allow cookies/auth headers
- `allow_methods=["*"]`: Allow GET, POST, PUT, DELETE, etc.
- `allow_headers=["*"]`: Allow any HTTP headers

### Home Page Endpoint

```python
@app.get("/", response_class=HTMLResponse)
```
**Explanation**: Decorator that registers this function to handle GET requests to "/" (home page)
- `response_class=HTMLResponse`: Tells FastAPI to return HTML content

```python
async def home(request: Request):
```
**Explanation**: Async function that handles home page requests
- `request: Request`: Receives the HTTP request object

```python
    return templates.TemplateResponse("index.html", {"request": request})
```
**Explanation**: Renders index.html template and returns it
- `"index.html"`: Template file name
- `{"request": request}`: Passes request object to template

### Query Request Model

```python
class QueryRequest(BaseModel):
    query: str
```
**Explanation**: Defines structure for query requests
- Pydantic will automatically validate that "query" field exists and is a string
- Example: `{"query": "How many customers?"}`

### Main Query Endpoint

```python
@app.post("/query")
```
**Explanation**: Registers function to handle POST requests to "/query"

```python
def run_query(req: QueryRequest):
```
**Explanation**: Function that processes natural language queries
- `req: QueryRequest`: Automatically parses JSON body into QueryRequest object

```python
    # 1. Translate user query
    english_query = translate_to_english(req.query)
```
**Explanation**: 
- Takes user's query (could be in any language)
- Translates it to English
- Example: "எத்தனை வாடிக்கையாளர்கள்?" → "How many customers?"

```python
    # 2. Load active database context
    ctx = get_active_db_context()
    schema = ctx["schema"]
```
**Explanation**:
- `get_active_db_context()`: Gets currently selected database
- Returns dictionary with name, type, url, and schema
- `ctx["schema"]`: Extracts just the schema part (tables, columns, etc.)

```python
    # 3. Build schema prompt
    schema_prompt = schema_to_prompt(schema)
```
**Explanation**: Converts schema dictionary into human-readable text format for LLM
- Input: `{"customers": {"columns": [...]}}`
- Output: "Table: customers\nColumns:\n- id (INTEGER)\n..."

```python
    # 4. Generate SQL
    sql = generate_sql(english_query, schema_prompt)
```
**Explanation**: Uses LLM (Ollama) to generate SQL query
- Takes English query + schema description
- Returns SQL: "SELECT COUNT(*) FROM customers"

```python
    # 5. Validate SQL
    if not is_safe_sql(sql):
        raise HTTPException(status_code=400, detail="Unsafe SQL detected")
```
**Explanation**: Security check
- `is_safe_sql(sql)`: Checks if SQL is SELECT-only and has no dangerous keywords
- If unsafe, raises HTTP 400 error and stops execution
- Prevents DROP, DELETE, UPDATE, etc.

```python
    # 6. Execute SQL on active DB
    columns, rows = execute_query(ctx["url"], sql)
```
**Explanation**: Runs the SQL query against the database
- `ctx["url"]`: Database connection string (e.g., "sqlite:///chinook.db")
- `sql`: The validated SQL query
- Returns column names and result rows

```python
    return {
        "active_database": ctx["name"],
        "english_query": english_query,
        "sql": sql,
        "columns": list(columns),
        "rows": [list(row) for row in rows],
    }
```
**Explanation**: Returns JSON response with all query information
- `active_database`: Which database was queried
- `english_query`: Translated query
- `sql`: Generated SQL
- `columns`: Column names as list
- `rows`: Result data as list of lists

### List Databases Endpoint

```python
@app.get("/databases")
def get_databases():
```
**Explanation**: Endpoint to get all registered databases

```python
    dbs, active = list_databases()
```
**Explanation**: Calls function that reads db_registry.json
- `dbs`: Dictionary of all databases
- `active`: Name of currently active database

```python
    return {
        "active": active,
        "databases": dbs
    }
```
**Explanation**: Returns JSON with active database name and full database list

### Add Database Models and Endpoint

```python
class AddDatabaseRequest(BaseModel):
    name: str
    type: str
    url: str
```
**Explanation**: Defines structure for adding new database
- `name`: User-friendly name (e.g., "chinook")
- `type`: Database type (e.g., "sqlite", "postgresql")
- `url`: Connection string (e.g., "sqlite:///chinook.db")

```python
@app.post("/databases/add")
def add_db(req: AddDatabaseRequest):
```
**Explanation**: Endpoint to register a new database

```python
    try:
        add_database(req.name, req.type, req.url)
        return {"status": "added"}
```
**Explanation**: 
- Calls function to add database to registry
- Returns success message if it works

```python
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```
**Explanation**: If database name already exists, return HTTP 400 error with message

### Select Database Endpoint

```python
class SelectDatabaseRequest(BaseModel):
    name: str
```
**Explanation**: Defines structure for selecting active database
- Just needs the database name

```python
@app.post("/databases/select")
def select_db(req: SelectDatabaseRequest):
```
**Explanation**: Endpoint to switch active database

```python
    try:
        set_active_database(req.name)
        return {"status": "active database changed"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```
**Explanation**: 
- Updates registry to set new active database
- Returns error if database name doesn't exist

### Discover Local SQLite Endpoint

```python
@app.get("/databases/local/sqlite")
def list_local_sqlite():
```
**Explanation**: Endpoint to find SQLite files in current directory

```python
    dbs = discover_sqlite_dbs(".")
```
**Explanation**: Scans current directory (".") for .db files

```python
    return {"sqlite_databases": dbs}
```
**Explanation**: Returns list of found SQLite databases

### Application Runner

```python
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```
**Explanation**: Starts server when script is run directly
- `host="0.0.0.0"`: Listen on all network interfaces
- `port=8000`: Run on port 8000
- Access at: http://localhost:8000

---

## 2. TRANSLATOR.PY - Language Translation

### Imports

```python
from langdetect import detect
```
**Explanation**: Library that detects which language text is written in

```python
import ollama
```
**Explanation**: Client library for Ollama (local LLM server)

### Schema Terms

```python
SCHEMA_TERMS = [
    "customer",
    "customers",
    "order",
    "orders",
    "amount",
    "city",
    "country"
]
```
**Explanation**: List of database-specific vocabulary
- These words should NOT be translated to synonyms
- Example: "வாடிக்கையாளர்கள்" should translate to "customers" not "clients"
- Ensures translated query matches actual table/column names

### Language Detection Function

```python
def detect_language(text: str) -> str:
```
**Explanation**: Function that identifies the language of input text
- `text: str`: Input text to analyze
- `-> str`: Returns language code (e.g., "en", "ta", "hi")

```python
    try:
        return detect(text)
```
**Explanation**: Uses langdetect library to identify language
- Returns ISO 639-1 language code
- Examples: "en" (English), "ta" (Tamil), "hi" (Hindi), "es" (Spanish)

```python
    except:
        return "en"
```
**Explanation**: If detection fails (empty text, unknown language), assume English
- Fallback ensures function always returns a value

### Translation Function

```python
def translate_to_english(text: str) -> str:
```
**Explanation**: Main translation function
- Takes text in any language
- Returns English translation

```python
    lang = detect_language(text)
```
**Explanation**: First detect what language the text is in

```python
    if lang == "en":
        return text
```
**Explanation**: If already English, skip translation (saves time and API calls)

```python
    schema_hint = ", ".join(SCHEMA_TERMS)
```
**Explanation**: Converts list to comma-separated string
- `["customer", "order"]` → `"customer, order"`
- This will be shown to LLM as vocabulary hints

```python
    prompt = f"""
You are a professional translator for a DATABASE QUERY SYSTEM.

Task:
Translate the following sentence from {lang.upper()} to English.
```
**Explanation**: Starts building prompt for LLM
- `{lang.upper()}`: Inserts detected language in uppercase (e.g., "TAMIL")
- Tells LLM this is for database queries (important context)

```python
CRITICAL RULES:
- Preserve the original meaning exactly
- Do NOT paraphrase
- Do NOT replace database terms with synonyms
- Prefer these schema terms when applicable: {schema_hint}
```
**Explanation**: Instructions to LLM
- "Preserve meaning": Don't change what user asked
- "No synonyms": Use exact database vocabulary
- `{schema_hint}`: Shows LLM the preferred database terms

```python
- Use the word "customers" when the meaning refers to people who buy or order
- Use simple, literal English
- Return ONLY the translated sentence
- Do NOT add explanations
```
**Explanation**: More specific instructions
- Ensures LLM returns just the translation, no extra text

```python
Sentence:
{text}
"""
```
**Explanation**: Inserts the actual text to translate

```python
    response = ollama.chat(
        model="qwen2.5:7b",
```
**Explanation**: Calls Ollama API
- `model="qwen2.5:7b"`: Uses Qwen 2.5 model with 7 billion parameters
- This model is good at multilingual tasks

```python
        messages=[
            {
                "role": "system",
                "content": "You are an expert Tamil and Hindi to English translator for database queries."
            },
```
**Explanation**: System message sets LLM's role/personality
- Tells it to be a translator specialized in database queries
- Mentions Tamil and Hindi specifically (common use case)

```python
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
```
**Explanation**: User message contains the actual translation request
- This is the prompt we built above

```python
    return response["message"]["content"].strip()
```
**Explanation**: Extracts translated text from response
- `response["message"]["content"]`: Gets the LLM's reply
- `.strip()`: Removes leading/trailing whitespace
- Returns clean English translation

---

## 3. DB_REGISTRY.PY - Database Management

### Imports

```python
import json
from pathlib import Path
```
**Explanation**:
- `json`: For reading/writing JSON files
- `Path`: Modern way to handle file paths

### Registry Path

```python
REGISTRY_PATH = Path("db_registry.json")
```
**Explanation**: Defines where database registry file is stored
- `Path("db_registry.json")`: File in current directory
- This file stores all registered databases

### Load Registry Function

```python
def load_registry():
```
**Explanation**: Reads database registry from disk

```python
    with open(REGISTRY_PATH, "r") as f:
```
**Explanation**: Opens file in read mode
- `with`: Automatically closes file when done
- `"r"`: Read mode

```python
        return json.load(f)
```
**Explanation**: Parses JSON file into Python dictionary
- Returns structure like: `{"active": "chinook", "databases": {...}}`

### Save Registry Function

```python
def save_registry(data):
```
**Explanation**: Writes database registry to disk
- `data`: Dictionary to save

```python
    with open(REGISTRY_PATH, "w") as f:
```
**Explanation**: Opens file in write mode
- `"w"`: Write mode (overwrites existing content)

```python
        json.dump(data, f, indent=2)
```
**Explanation**: Converts dictionary to JSON and writes to file
- `indent=2`: Pretty-prints with 2-space indentation (human-readable)

### List Databases Function

```python
def list_databases():
```
**Explanation**: Gets all registered databases and which one is active

```python
    registry = load_registry()
```
**Explanation**: Loads current registry from file

```python
    return registry["databases"], registry["active"]
```
**Explanation**: Returns two values
- `registry["databases"]`: Dictionary of all databases
- `registry["active"]`: Name of currently active database

### Add Database Function

```python
def add_database(name: str, db_type: str, url: str):
```
**Explanation**: Registers a new database
- `name`: User-friendly identifier (e.g., "chinook")
- `db_type`: Type of database (e.g., "sqlite", "postgresql")
- `url`: Connection string (e.g., "sqlite:///chinook.db")

```python
    registry = load_registry()
```
**Explanation**: Load current registry

```python
    if name in registry["databases"]:
        raise ValueError("Database name already exists")
```
**Explanation**: Check if name is already used
- Prevents duplicate names
- Raises error if name exists

```python
    registry["databases"][name] = {
        "type": db_type,
        "url": url
    }
```
**Explanation**: Adds new database to registry
- Creates entry with type and connection URL

```python
    save_registry(registry)
```
**Explanation**: Writes updated registry back to file

### Set Active Database Function

```python
def set_active_database(name: str):
```
**Explanation**: Changes which database is currently active
- All queries will run against this database

```python
    registry = load_registry()
```
**Explanation**: Load current registry

```python
    if name not in registry["databases"]:
        raise ValueError("Database not found")
```
**Explanation**: Validate database exists
- Can't activate a database that isn't registered

```python
    registry["active"] = name
```
**Explanation**: Updates active database field

```python
    save_registry(registry)
```
**Explanation**: Saves change to file

### Get Active Database Function

```python
def get_active_database():
```
**Explanation**: Gets currently active database details

```python
    registry = load_registry()
```
**Explanation**: Load registry

```python
    active = registry["active"]
```
**Explanation**: Get name of active database

```python
    return active, registry["databases"][active]
```
**Explanation**: Returns tuple with:
- Database name (e.g., "chinook")
- Database details (e.g., `{"type": "sqlite", "url": "..."}`)

---

## 4. DB_CONTEXT.PY - Schema Loading & Query Execution

### Imports

```python
from sqlalchemy import create_engine, inspect, text
```
**Explanation**:
- `create_engine`: Creates database connection
- `inspect`: Examines database structure
- `text`: Wraps SQL strings for safe execution

```python
from db_registry import get_active_database
```
**Explanation**: Import function to get current database

```python
from sql_validator import clean_sql
```
**Explanation**: Import function to clean SQL (remove markdown)

### Load Schema Function

```python
def load_schema(database_url: str):
```
**Explanation**: Extracts complete database structure
- `database_url`: Connection string (e.g., "sqlite:///chinook.db")

```python
    engine = create_engine(database_url)
```
**Explanation**: Creates SQLAlchemy engine
- Engine manages database connections
- Works with PostgreSQL, SQLite, MySQL, etc.

```python
    inspector = inspect(engine)
```
**Explanation**: Creates inspector object
- Inspector can examine database structure
- Can list tables, columns, keys, etc.

```python
    schema = {}
```
**Explanation**: Initialize empty dictionary to store schema

```python
    for table_name in inspector.get_table_names():
```
**Explanation**: Loop through all tables in database
- `get_table_names()`: Returns list like ["customers", "orders"]

```python
        columns = inspector.get_columns(table_name)
```
**Explanation**: Get all columns for this table
- Returns list of dictionaries with column info
- Each has: name, type, nullable, default, etc.

```python
        primary_keys = inspector.get_pk_constraint(table_name).get(
            "constrained_columns", []
        )
```
**Explanation**: Get primary key columns
- `get_pk_constraint()`: Returns primary key info
- `.get("constrained_columns", [])`: Extract column names, default to empty list
- Example: ["customer_id"]

```python
        foreign_keys = inspector.get_foreign_keys(table_name)
```
**Explanation**: Get foreign key relationships
- Returns list of foreign keys
- Each shows which column references which table

```python
        schema[table_name] = {
```
**Explanation**: Start building schema entry for this table

```python
            "columns": [
                {"name": col["name"], "type": str(col["type"])}
                for col in columns
            ],
```
**Explanation**: List comprehension to extract column info
- For each column, create dict with name and type
- `str(col["type"])`: Convert SQLAlchemy type to string
- Example: `[{"name": "id", "type": "INTEGER"}]`

```python
            "primary_key": primary_keys,
```
**Explanation**: Store primary key column names

```python
            "foreign_keys": [
                {
                    "column": fk["constrained_columns"],
                    "ref_table": fk["referred_table"],
                    "ref_column": fk["referred_columns"],
                }
                for fk in foreign_keys
            ],
```
**Explanation**: Extract foreign key relationships
- `constrained_columns`: Column in this table
- `referred_table`: Table it references
- `referred_columns`: Column in referenced table
- Example: `{"column": ["customer_id"], "ref_table": "customers", "ref_column": ["id"]}`

```python
        }
```
**Explanation**: Close schema entry for this table

```python
    return schema
```
**Explanation**: Return complete schema dictionary

### Execute Query Function

```python
def execute_query(database_url: str, sql: str):
```
**Explanation**: Runs SQL query against database
- `database_url`: Connection string
- `sql`: SQL query to execute

```python
    sql = clean_sql(sql)
```
**Explanation**: Remove markdown code fences if present
- LLM might return: "```sql\nSELECT...\n```"
- This cleans it to: "SELECT..."

```python
    engine = create_engine(database_url)
```
**Explanation**: Create database connection

```python
    with engine.connect() as conn:
```
**Explanation**: Open connection
- `with`: Automatically closes connection when done
- `conn`: Connection object

```python
        result = conn.execute(text(sql))
```
**Explanation**: Execute SQL query
- `text(sql)`: Wraps SQL string for safe execution
- `result`: Contains query results

```python
        rows = result.fetchall()
```
**Explanation**: Get all result rows
- Returns list of tuples
- Example: `[(1, "John"), (2, "Jane")]`

```python
        columns = result.keys()
```
**Explanation**: Get column names
- Returns list like: `["id", "name"]`

```python
        return columns, rows
```
**Explanation**: Return both column names and data

### Get Active DB Context Function

```python
def get_active_db_context():
```
**Explanation**: Gets complete context for active database
- Combines registry info with schema

```python
    name, db = get_active_database()
```
**Explanation**: Get active database from registry
- `name`: Database name (e.g., "chinook")
- `db`: Database details (type, url)

```python
    schema = load_schema(db["url"])
```
**Explanation**: Load full schema for this database

```python
    return {
        "name": name,
        "type": db["type"],
        "url": db["url"],
        "schema": schema,
    }
```
**Explanation**: Return complete context dictionary
- Has everything needed to query this database

---

## 5. PROMPT_BUILDER.PY - Schema Formatting

### Schema to Prompt Function

```python
def schema_to_prompt(schema: dict) -> str:
```
**Explanation**: Converts schema dictionary to human-readable text
- Input: Python dictionary with tables/columns
- Output: Formatted text for LLM

```python
    lines = []
```
**Explanation**: Initialize list to collect text lines

```python
    for table, info in schema.items():
```
**Explanation**: Loop through each table
- `table`: Table name (e.g., "customers")
- `info`: Table details (columns, keys, etc.)

```python
        lines.append(f"Table: {table}")
```
**Explanation**: Add table name header
- Example: "Table: customers"

```python
        lines.append("Columns:")
```
**Explanation**: Add columns section header

```python
        for col in info["columns"]:
            lines.append(f"- {col['name']} ({col['type']})")
```
**Explanation**: Add each column with its type
- Example: "- customer_id (INTEGER)"
- Example: "- name (VARCHAR)"

```python
        if info["primary_key"]:
            lines.append(f"Primary Key: {', '.join(info['primary_key'])}")
```
**Explanation**: Add primary key if exists
- `', '.join()`: Combines list into comma-separated string
- Example: "Primary Key: customer_id"

```python
        if info["foreign_keys"]:
            lines.append("Foreign Keys:")
```
**Explanation**: Add foreign keys section if any exist

```python
            for fk in info["foreign_keys"]:
                lines.append(
                    f"- {fk['column'][0]} → {fk['ref_table']}.{fk['ref_column'][0]}"
                )
```
**Explanation**: Add each foreign key relationship
- Shows which column references which table.column
- Example: "- customer_id → customers.id"
- `→` symbol makes relationship clear

```python
        lines.append("")
```
**Explanation**: Add blank line between tables
- Makes output more readable

```python
    return "\n".join(lines)
```
**Explanation**: Join all lines with newlines
- Converts list to single string
- Each line becomes a new line in output

---

## 6. SQL_GENERATOR.PY - LLM SQL Generation

### Import

```python
import ollama
```
**Explanation**: Ollama client for local LLM

### Generate SQL Function

```python
def generate_sql(english_query: str, schema_prompt: str) -> str:
```
**Explanation**: Uses LLM to generate SQL
- `english_query`: What user wants (e.g., "How many customers?")
- `schema_prompt`: Database structure description
- Returns: SQL query string

```python
    prompt = f"""
You are an expert SQL assistant.

Database schema:
{schema_prompt}
```
**Explanation**: Start building prompt
- Tells LLM its role
- Provides complete database schema

```python
Task:
Generate a SQL query that answers the following question.

Rules:
- Use ONLY the tables and columns in the schema
- Target database: PostgreSQL
- Do NOT hallucinate tables or columns
- Return ONLY the SQL query
- No explanations
```
**Explanation**: Clear instructions for LLM
- "Use ONLY": Prevents making up table names
- "PostgreSQL": Specifies SQL dialect
- "Return ONLY": Don't add explanations

```python
Question:
{english_query}
"""
```
**Explanation**: Insert user's question

```python
    response = ollama.chat(
        model="qwen2.5:7b",
```
**Explanation**: Call Ollama API
- Uses Qwen 2.5 model (7 billion parameters)

```python
        messages=[
            {"role": "system", "content": "You generate precise SQL queries."},
```
**Explanation**: System message sets LLM behavior
- Reinforces that it should generate SQL

```python
            {"role": "user", "content": prompt}
        ]
    )
```
**Explanation**: User message contains the full prompt

```python
    return response["message"]["content"].strip()
```
**Explanation**: Extract and return SQL
- Gets LLM's response text
- Strips whitespace

---

## 7. SQL_VALIDATOR.PY - Security Validation

### Imports

```python
import sqlparse
import re
```
**Explanation**:
- `sqlparse`: Parses SQL to analyze structure
- `re`: Regular expressions for pattern matching

### Forbidden Keywords

```python
FORBIDDEN_KEYWORDS = {
    "drop",
    "delete",
    "update",
    "insert",
    "alter",
    "truncate",
    "grant",
    "revoke"
}
```
**Explanation**: Set of dangerous SQL keywords
- These modify or delete data
- We only allow SELECT (read-only)

### Clean SQL Function

```python
def clean_sql(sql: str) -> str:
    """
    Remove markdown code fences and extra whitespace.
    """
```
**Explanation**: Removes markdown formatting from LLM output

```python
    sql = sql.strip()
```
**Explanation**: Remove leading/trailing whitespace

```python
    sql = re.sub(r"^```sql", "", sql, flags=re.IGNORECASE).strip()
```
**Explanation**: Remove opening ```sql fence
- `r"^```sql"`: Pattern matching ```sql at start
- `flags=re.IGNORECASE`: Case-insensitive (matches ```SQL too)
- `""`: Replace with empty string (remove it)

```python
    sql = re.sub(r"^```", "", sql).strip()
```
**Explanation**: Remove opening ``` fence (without sql)

```python
    sql = re.sub(r"```$", "", sql).strip()
```
**Explanation**: Remove closing ``` fence
- `$`: Matches end of string

```python
    return sql
```
**Explanation**: Return cleaned SQL

### Is Safe SQL Function

```python
def is_safe_sql(sql: str) -> bool:
```
**Explanation**: Validates SQL is safe to execute
- Returns True if safe, False if dangerous

```python
    sql = clean_sql(sql)
```
**Explanation**: First clean the SQL

```python
    parsed = sqlparse.parse(sql)
```
**Explanation**: Parse SQL into structured format
- Returns list of SQL statements

```python
    if not parsed:
        return False
```
**Explanation**: If parsing failed, reject
- Invalid SQL

```python
    statement = parsed[0]
```
**Explanation**: Get first statement
- We only allow single statements

```python
    first_token = statement.token_first(skip_cm=True)
```
**Explanation**: Get first meaningful token
- `skip_cm=True`: Skip comments

```python
    if not first_token or first_token.value.upper() != "SELECT":
        return False
```
**Explanation**: Check if starts with SELECT
- Only SELECT queries allowed
- Rejects INSERT, UPDATE, DELETE, DROP, etc.

```python
    tokens = [t.value.lower() for t in statement.flatten() if t.value]
```
**Explanation**: Get all tokens as lowercase
- `flatten()`: Gets all tokens in statement
- Converts to lowercase for comparison

```python
    for keyword in FORBIDDEN_KEYWORDS:
        if keyword in tokens:
            return False
```
**Explanation**: Check for forbidden keywords
- If any dangerous keyword found, reject

```python
    return True
```
**Explanation**: If all checks pass, SQL is safe

---

## Summary

This walkthrough explained:
- **Every import** and why it's needed
- **Every function** and its purpose
- **Every line of code** with examples
- **Data flow** through the system
- **Security measures** at each step
- **Error handling** strategies

The code is modular, secure, and extensible!
