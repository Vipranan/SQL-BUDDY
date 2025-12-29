def schema_to_prompt(schema: dict) -> str:
    lines = []

    for table, info in schema.items():
        lines.append(f"Table: {table}")
        lines.append("Columns:")

        for col in info["columns"]:
            lines.append(f"- {col['name']} ({col['type']})")

        if info["primary_key"]:
            lines.append(f"Primary Key: {', '.join(info['primary_key'])}")

        if info["foreign_keys"]:
            lines.append("Foreign Keys:")
            for fk in info["foreign_keys"]:
                lines.append(
                    f"- {fk['column'][0]} → {fk['ref_table']}.{fk['ref_column'][0]}"
                )

        lines.append("")  # blank line

    return "\n".join(lines)