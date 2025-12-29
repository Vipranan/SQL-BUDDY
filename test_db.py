from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg2://nancypravin@localhost/sql_buddy_db"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM customers"))
    for row in result:
        print(row)