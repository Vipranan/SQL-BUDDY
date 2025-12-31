from schema_extractor_sqlite import schema
from prompt_builder import schema_to_prompt
from sql_generator import generate_sql
from translator import translate_to_english
from sql_executor_sqlite import execute_sql

user_query = "Who are the customers from Canada?"

english = translate_to_english(user_query)
schema_prompt = schema_to_prompt(schema)
sql = generate_sql(english, schema_prompt)

print("SQL:", sql)

cols, rows = execute_sql(sql)
print(cols)
for row in rows[:5]:
    print(row)