import ollama


def generate_sql(english_query: str, schema_prompt: str) -> str:
    prompt = f"""
You are an expert SQL assistant.

Database schema:
{schema_prompt}

Task:
Generate a SQL query that answers the following question.

Rules:
- Use ONLY the tables and columns in the schema
- Target database: PostgreSQL
- Do NOT hallucinate tables or columns
- Return ONLY the SQL query
- No explanations

Question:
{english_query}
"""

    response = ollama.chat(
        model="qwen2.5:7b",
        messages=[
            {"role": "system", "content": "You generate precise SQL queries."},
            {"role": "user", "content": prompt}
        ]
    )

    return response["message"]["content"].strip()