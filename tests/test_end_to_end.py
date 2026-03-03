from schema_extractor import schema
from prompt_builder import schema_to_prompt
from translator import translate_to_english
from sql_generator import generate_sql
from sql_validator import is_safe_sql
from sql_executor import execute_sql

# User input (try Tamil / Hindi / English)
user_query = "சென்னையில் உள்ள வாடிக்கையாளர்கள் யார்?"

# Pipeline
english_query = translate_to_english(user_query)
schema_prompt = schema_to_prompt(schema)
sql = generate_sql(english_query, schema_prompt).strip()

print("Generated SQL:")
print(sql)
print("-" * 40)

if not is_safe_sql(sql):
    print("❌ Unsafe SQL detected. Execution blocked.")
else:
    columns, rows = execute_sql(sql)
    print("✅ Query Result:")
    print(columns)
    for row in rows:
        print(row)