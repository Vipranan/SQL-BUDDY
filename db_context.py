from sqlalchemy import create_engine, inspect, text
from db_registry import get_active_database
from sql_validator import clean_sql


def load_schema(database_url: str):
    engine = create_engine(database_url)
    inspector = inspect(engine)

    schema = {}

    for table_name in inspector.get_table_names():
        columns = inspector.get_columns(table_name)
        primary_keys = inspector.get_pk_constraint(table_name).get(
            "constrained_columns", []
        )
        foreign_keys = inspector.get_foreign_keys(table_name)

        schema[table_name] = {
            "columns": [
                {"name": col["name"], "type": str(col["type"])}
                for col in columns
            ],
            "primary_key": primary_keys,
            "foreign_keys": [
                {
                    "column": fk["constrained_columns"],
                    "ref_table": fk["referred_table"],
                    "ref_column": fk["referred_columns"],
                }
                for fk in foreign_keys
            ],
        }

    return schema


def execute_query(database_url: str, sql: str):
    sql = clean_sql(sql)
    engine = create_engine(database_url)

    with engine.connect() as conn:
        result = conn.execute(text(sql))
        rows = result.fetchall()
        columns = result.keys()
        return columns, rows


def get_active_db_context():
    name, db = get_active_database()
    schema = load_schema(db["url"])

    return {
        "name": name,
        "type": db["type"],
        "url": db["url"],
        "schema": schema,
    }