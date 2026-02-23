# SQL Buddy 🤖

A natural language to SQL query system that supports multiple languages and databases. Ask questions in Tamil, Hindi, English, or any language, and get instant SQL results!

## 🌟 Features

- **Multi-language Support**: Query in Tamil, Hindi, English, or 55+ languages
- **Natural Language Processing**: Convert plain language questions to SQL
- **Multiple Database Support**: Works with PostgreSQL, SQLite, MySQL, and more
- **Security First**: Read-only queries with SQL injection prevention
- **Local LLM**: Uses Ollama for privacy and no API costs
- **Database Registry**: Manage and switch between multiple databases
- **Auto-discovery**: Automatically find SQLite databases in your directory
- **REST API**: Easy integration with any frontend

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Ollama installed ([Installation Guide](https://ollama.ai))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sql-buddy
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install and start Ollama:
```bash
# Install Ollama from https://ollama.ai
# Then pull the required model:
ollama pull qwen2.5:7b
```

4. Configure your database in `db_registry.json`:
```json
{
  "active": "chinook",
  "databases": {
    "chinook": {
      "type": "sqlite",
      "url": "sqlite:///chinook.db"
    }
  }
}
```

5. Run the application:
```bash
python app.py
```

6. Open your browser:
```
http://localhost:8000
```

## 📖 Usage Examples

### Example 1: English Query
```json
POST /query
{
  "query": "How many customers are in each city?"
}
```

**Response:**
```json
{
  "active_database": "chinook",
  "english_query": "How many customers are in each city?",
  "sql": "SELECT city, COUNT(*) FROM customers GROUP BY city",
  "columns": ["city", "COUNT(*)"],
  "rows": [["New York", 15], ["London", 12], ["Paris", 8]]
}
```

### Example 2: Tamil Query
```json
POST /query
{
  "query": "சென்னையில் எத்தனை வாடிக்கையாளர்கள் உள்ளனர்?"
}
```

**Response:**
```json
{
  "active_database": "chinook",
  "english_query": "How many customers are in Chennai?",
  "sql": "SELECT COUNT(*) FROM customers WHERE city = 'Chennai'",
  "columns": ["COUNT(*)"],
  "rows": [[15]]
}
```

### Example 3: Hindi Query
```json
POST /query
{
  "query": "सबसे अधिक ऑर्डर किस शहर में हैं?"
}
```

**Response:**
```json
{
  "active_database": "chinook",
  "english_query": "Which city has the most orders?",
  "sql": "SELECT city, COUNT(*) as order_count FROM orders JOIN customers ON orders.customer_id = customers.id GROUP BY city ORDER BY order_count DESC LIMIT 1",
  "columns": ["city", "order_count"],
  "rows": [["Mumbai", 45]]
}
```

## 🔌 API Endpoints

### Query Endpoint
```http
POST /query
Content-Type: application/json

{
  "query": "your natural language question"
}
```

### List Databases
```http
GET /databases
```

### Add Database
```http
POST /databases/add
Content-Type: application/json

{
  "name": "mydb",
  "type": "postgresql",
  "url": "postgresql://user:password@localhost/mydb"
}
```

### Switch Active Database
```http
POST /databases/select
Content-Type: application/json

{
  "name": "mydb"
}
```

### Discover Local SQLite Databases
```http
GET /databases/local/sqlite
```

## 🏗️ Architecture

```
User Query (Any Language)
    ↓
Language Detection (langdetect)
    ↓
Translation to English (Ollama LLM)
    ↓
Schema Loading (SQLAlchemy)
    ↓
Schema Formatting (prompt_builder)
    ↓
SQL Generation (Ollama LLM)
    ↓
SQL Validation (Security Check)
    ↓
Query Execution (SQLAlchemy)
    ↓
Results (JSON)
```

## 📁 Project Structure

```
sql-buddy/
├── app.py                          # Main FastAPI application
├── translator.py                   # Language detection & translation
├── db_registry.py                  # Database management
├── db_context.py                   # Schema loading & query execution
├── prompt_builder.py               # Schema to text formatting
├── sql_generator.py                # LLM SQL generation
├── sql_validator.py                # Security validation
├── sql_executor.py                 # Query executor (legacy)
├── schema_extractor.py             # Schema extraction utility
├── sqlite_discovery.py             # SQLite file discovery
├── db_registry.json                # Database registry
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── PROJECT_EXPLANATION.txt         # Detailed project overview
├── CODE_EXPLANATION.md             # Code examples & flow
├── DETAILED_CODE_WALKTHROUGH.md    # Line-by-line code explanation
├── web/
│   └── index.html                  # Frontend interface
├── tests/
│   ├── test_chinook.py             # Chinook DB tests
│   ├── test_db.py                  # Database tests
│   ├── test_end_to_end.py          # Integration tests
│   ├── test_prompt.py              # Prompt building tests
│   ├── test_sql_generation.py      # SQL generation tests
│   └── test_translation.py         # Translation tests
└── *.db                            # Sample SQLite databases
```

## 🔒 Security Features

- **Read-Only Queries**: Only SELECT statements allowed
- **Keyword Blocking**: Blocks DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE, GRANT, REVOKE
- **SQL Parsing**: Uses sqlparse to validate query structure
- **Markdown Cleaning**: Removes code fences from LLM output
- **Input Validation**: Pydantic models validate all API inputs

## 🛠️ Configuration

### Database Registry (`db_registry.json`)

```json
{
  "active": "chinook",
  "databases": {
    "chinook": {
      "type": "sqlite",
      "url": "sqlite:///chinook.db"
    },
    "postgres_db": {
      "type": "postgresql",
      "url": "postgresql://user:password@localhost:5432/mydb"
    },
    "mysql_db": {
      "type": "mysql",
      "url": "mysql://user:password@localhost:3306/mydb"
    }
  }
}
```

### Supported Database Types

- SQLite: `sqlite:///path/to/database.db`
- PostgreSQL: `postgresql://user:password@host:port/database`
- MySQL: `mysql://user:password@host:port/database`
- MariaDB: `mariadb://user:password@host:port/database`
- Oracle: `oracle://user:password@host:port/database`
- Microsoft SQL Server: `mssql+pyodbc://user:password@host:port/database`

## 🧪 Testing

Run all tests:
```bash
pytest
```

Run specific test file:
```bash
pytest tests/test_translation.py
pytest tests/test_sql_generation.py
pytest tests/test_end_to_end.py
```

## 📚 Documentation

- **[PROJECT_EXPLANATION.txt](PROJECT_EXPLANATION.txt)**: High-level overview of the system
- **[CODE_EXPLANATION.md](CODE_EXPLANATION.md)**: Code examples and query flow
- **[DETAILED_CODE_WALKTHROUGH.md](DETAILED_CODE_WALKTHROUGH.md)**: Line-by-line code explanation

## 🌍 Supported Languages

The system supports 55+ languages including:

- English (en)
- Tamil (ta)
- Hindi (hi)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- And many more!

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 🐛 Troubleshooting

### Ollama Connection Error
```bash
# Make sure Ollama is running:
ollama serve

# Check if model is installed:
ollama list

# Pull model if missing:
ollama pull qwen2.5:7b
```

### Database Connection Error
- Check your connection string in `db_registry.json`
- Ensure database server is running
- Verify credentials and permissions

### Translation Not Working
- Ensure Ollama is running
- Check if qwen2.5:7b model is installed
- Verify internet connection for langdetect

### SQL Validation Failing
- Check if query is SELECT-only
- Ensure no forbidden keywords (DROP, DELETE, etc.)
- Verify SQL syntax is correct

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - Database toolkit
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [langdetect](https://github.com/Mimino666/langdetect) - Language detection
- [sqlparse](https://github.com/andialbrecht/sqlparse) - SQL parser

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: your-email@example.com
- Documentation: See docs folder

## 🗺️ Roadmap

- [ ] Add support for more LLM models (GPT-4, Claude, Llama)
- [ ] Implement query caching
- [ ] Add user authentication
- [ ] Support for complex joins and subqueries
- [ ] Query history and favorites
- [ ] Export results to CSV/Excel
- [ ] Real-time query suggestions
- [ ] Database schema visualization
- [ ] Multi-database queries
- [ ] Natural language result explanations

## 💡 Use Cases

- **Business Intelligence**: Non-technical users can query databases
- **Data Analysis**: Quick ad-hoc queries without writing SQL
- **Multilingual Teams**: Team members can query in their native language
- **Education**: Learn SQL by seeing natural language translations
- **Accessibility**: Makes databases accessible to non-programmers

---

Made with ❤️ by SQL Buddy Team
