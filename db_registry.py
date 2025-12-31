import json
from pathlib import Path

REGISTRY_PATH = Path("db_registry.json")


def load_registry():
    with open(REGISTRY_PATH, "r") as f:
        return json.load(f)


def save_registry(data):
    with open(REGISTRY_PATH, "w") as f:
        json.dump(data, f, indent=2)


def list_databases():
    registry = load_registry()
    return registry["databases"], registry["active"]


def add_database(name: str, db_type: str, url: str):
    registry = load_registry()

    if name in registry["databases"]:
        raise ValueError("Database name already exists")

    registry["databases"][name] = {
        "type": db_type,
        "url": url
    }

    save_registry(registry)


def set_active_database(name: str):
    registry = load_registry()

    if name not in registry["databases"]:
        raise ValueError("Database not found")

    registry["active"] = name
    save_registry(registry)


def get_active_database():
    registry = load_registry()
    active = registry["active"]
    return active, registry["databases"][active]