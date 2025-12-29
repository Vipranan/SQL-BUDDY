from schema_extractor import schema
from prompt_builder import schema_to_prompt
from sql_generator import generate_sql

schema_prompt = schema_to_prompt(schema)

query = "Who are the customers in Chennai?"

sql = generate_sql(query, schema_prompt)

print(sql)