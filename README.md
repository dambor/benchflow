# NoSQLBench Schema Generator

A full-stack web application for generating NoSQLBench YAML files from Cassandra CQL schema definitions. This tool helps automate the creation of NoSQLBench configuration files for data ingestion and performance testing of Cassandra/DataStax databases.

![NoSQLBench Schema Generator](https://example.com/nosqlbench-generator.png)

## Features

- **Schema Parsing**: Upload and parse Cassandra CQL schema files
- **Visual Selection**: Browse keyspaces and tables with an intuitive interface
- **Smart Bindings**: Automatically generate appropriate NoSQLBench bindings based on column data types
- **Configurable**: Adjust NoSQLBench parameters (cycles, threads, consistency)
- **Downloadable YAMLs**: Generate and download YAML files as a zip archive

## Quick Start

### Option 1: Using Make

If you have Make installed, you can use the Makefile to manage the project:

```bash
# Set up the project structure
make setup

# Install dependencies
make install-deps

# Start the application
make start
```

### Option 2: Using Docker Compose Directly

```bash
# Clone the repository
git clone https://github.com/yourusername/nosqlbench-schema-generator.git
cd nosqlbench-schema-generator

# Start the application
docker-compose up -d
```

### Option 3: One-line Install Script

```bash
curl -s https://raw.githubusercontent.com/yourusername/nosqlbench-schema-generator/main/quick-install.sh | bash
```

After installation, access the web interface at http://localhost

## Using the Application

1. **Upload Schema**: Upload your Cassandra CQL schema file (.cql or .txt format)
2. **Parse Schema**: Click the "Parse Schema" button to analyze the schema structure
3. **Select Tables**: Choose the keyspaces and tables you want to generate NoSQLBench files for
4. **Configure NoSQLBench**: Adjust cycles, threads, and consistency level as needed
5. **Generate YAML Files**: Click "Generate NoSQLBench YAML Files" to download the zip file
6. **Use with NoSQLBench**: The downloaded files can be used with NoSQLBench for data ingestion and testing

## Makefile Commands

The project includes a comprehensive Makefile to help you manage development and deployment:

### Setup and Installation
```bash
make setup              # Set up the project structure
make install-deps       # Install all dependencies
make build              # Build Docker containers
```

### Running the Application
```bash
make start              # Start the application in Docker
make stop               # Stop the application
make restart            # Restart the application
make logs               # View container logs
```

### Development
```bash
make dev                # Start development environment (backend + frontend)
make dev-backend        # Start backend development server only
make dev-frontend       # Start frontend development server only
make test               # Run tests
make lint               # Run linters
```

### Utility
```bash
make sample             # Create a sample schema file
make clean              # Clean the project
make check-docker       # Check Docker installation
make version            # Display version information
make help               # Show available commands
```

## Running NoSQLBench with Generated YAML Files

After generating the YAML files, you can use them with NoSQLBench:

```bash
# Create the keyspace and tables
nb run driver=cql yaml=my_schema.yaml tags=block:schema cycles=UNDEF

# Ingest data
nb run driver=cql yaml=my_schema.yaml tags=block:rampup threads=auto cycles=1000000
```

## Sample Output

The generated YAML files will have the following structure:

```yaml
scenarios:
  default:
    schema1: run driver=cql tags=block:"schema.*" threads===UNDEF cycles==UNDEF
    rampup1: run driver=cql tags='block:rampup1' cycles===TEMPLATE(rampup-cycles,1000000) threads=auto

bindings:
  user_id : ToHashedUUID();
  username : AlphaNumericString(36);
  email : AlphaNumericString(36);
  created_at : AddHashRange(0,2419200000L); StartingEpochMillis('2025-01-01 05:00:00'); ToJavaInstant();
  active : AddCycleRange(0,1); ToBoolean();
  
blocks:
  schema1:
    params:
      prepared: false
    ops:
      create_table1: | 
        CREATE TABLE if not exists <<keyspace:test_keyspace>>.users (...)
  rampup1:
    params:
      cl: ONE
      instrument: true
      prepared: true
    ops:
      insert_rampup1: |
        insert into <<keyspace:test_keyspace>>.users (...) values (...)
```

## Project Structure

```
nosqlbench-schema-generator/
├── Makefile                # Project management commands
├── docker-compose.yml      # Docker Compose configuration
│
├── backend/                # Python FastAPI Backend
│   ├── Dockerfile          # Backend Docker configuration
│   ├── requirements.txt    # Python dependencies
│   ├── main.py             # FastAPI application entry point
│   └── schema_parser.py    # CQL parser and YAML generator
│
└── frontend/               # React Frontend
    ├── Dockerfile          # Frontend Docker configuration
    ├── nginx.conf          # Nginx configuration for serving the app
    ├── package.json        # Node.js dependencies
    ├── public/             # Static assets
    └── src/                # React source code
        ├── App.tsx         # Main application component
        └── components/     # UI components
            ├── KeyspaceList.tsx
            ├── NoSqlBenchOptions.tsx
            └── SchemaTable.tsx
```

## Development Setup

If you want to develop or modify the application:

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Requirements

- Docker and Docker Compose
- For development: Python 3.9+, Node.js 16+

## Troubleshooting

Common issues and solutions:

1. **Connection Error**: If you cannot connect to the application, make sure ports 80 and 8000 are not in use by other applications.

2. **Upload Errors**: The maximum file size for schema uploads is 10MB. If your schema is larger, consider splitting it into multiple files.

3. **Parser Errors**: If the schema parsing fails, check your CQL syntax. The parser supports standard Cassandra CQL syntax.

4. **Container Issues**: If containers fail to start, check Docker logs with `make logs` or `docker-compose logs`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [NoSQLBench](https://github.com/nosqlbench/nosqlbench) for the excellent testing tool
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework