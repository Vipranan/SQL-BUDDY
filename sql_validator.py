import sqlparse
import re

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


def clean_sql(sql: str) -> str:
    """
    Remove markdown code fences and extra whitespace.
    """
    sql = sql.strip()

    # Remove ```sql or ``` wrappers
    sql = re.sub(r"^```sql", "", sql, flags=re.IGNORECASE).strip()
    sql = re.sub(r"^```", "", sql).strip()
    sql = re.sub(r"```$", "", sql).strip()

    return sql


def is_safe_sql(sql: str) -> bool:
    sql = clean_sql(sql)

    parsed = sqlparse.parse(sql)
    if not parsed:
        return False

    statement = parsed[0]

    # Only allow SELECT statements
    first_token = statement.token_first(skip_cm=True)
    if not first_token or first_token.value.upper() != "SELECT":
        return False

    tokens = [t.value.lower() for t in statement.flatten() if t.value]

    for keyword in FORBIDDEN_KEYWORDS:
        if keyword in tokens:
            return False

    return True