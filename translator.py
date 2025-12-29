from langdetect import detect
import ollama

# IMPORTANT: schema vocabulary (later this will be dynamic)
SCHEMA_TERMS = [
    "customer",
    "customers",
    "order",
    "orders",
    "amount",
    "city",
    "country"
]


def detect_language(text: str) -> str:
    try:
        return detect(text)
    except:
        return "en"


def translate_to_english(text: str) -> str:
    lang = detect_language(text)

    if lang == "en":
        return text

    schema_hint = ", ".join(SCHEMA_TERMS)

    prompt = f"""
You are a professional translator for a DATABASE QUERY SYSTEM.

Task:
Translate the following sentence from {lang.upper()} to English.

CRITICAL RULES:
- Preserve the original meaning exactly
- Do NOT paraphrase
- Do NOT replace database terms with synonyms
- Prefer these schema terms when applicable: {schema_hint}
- Use the word "customers" when the meaning refers to people who buy or order
- Use simple, literal English
- Return ONLY the translated sentence
- Do NOT add explanations

Sentence:
{text}
"""

    response = ollama.chat(
        model="qwen2.5:7b",
        messages=[
            {
                "role": "system",
                "content": "You are an expert Tamil and Hindi to English translator for database queries."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"].strip()