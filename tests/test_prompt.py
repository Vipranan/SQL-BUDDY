from schema_extractor import schema
from prompt_builder import schema_to_prompt

prompt_text = schema_to_prompt(schema)
print(prompt_text)