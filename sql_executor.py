from sqlalchemy import create_engine, text
from sql_validator import clean_sql

DATABASE_URL = "postgresql+psycopg2://nancypravin@localhost/sql_buddy_db"

engine = create_engine(DATABASE_URL)


def execute_sql(sql: str):
    sql = clean_sql(sql)  # 🔥 IMPORTANT

    with engine.connect() as conn:
        result = conn.execute(text(sql))
        rows = result.fetchall()
        columns = result.keys()
        return columns, rows