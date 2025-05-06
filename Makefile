# NoSQLBench Schema Generator Makefile
# A makefile to manage the NoSQLBench Schema Generator project

# Variables
SHELL := /bin/bash
PROJECT_DIR := $(shell pwd)
BACKEND_DIR := $(PROJECT_DIR)/backend
FRONTEND_DIR := $(PROJECT_DIR)/frontend
DOCKER_COMPOSE := docker-compose
PYTHON := python3
PIP := pip3
NPM := npm

# Help command
.PHONY: help
help:
	@echo "NoSQLBench Schema Generator Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make setup              Setup the complete project"
	@echo "  make install-deps       Install all dependencies"
	@echo "  make start              Start the application with Docker"
	@echo "  make stop               Stop the application"
	@echo "  make restart            Restart the application"
	@echo "  make build              Build the project"
	@echo "  make clean              Clean the project"
	@echo "  make logs               Show container logs"
	@echo ""
	@echo "Development:"
	@echo "  make dev                Start development environment"
	@echo "  make dev-backend        Start backend development server"
	@echo "  make dev-frontend       Start frontend development server"
	@echo "  make test               Run tests"
	@echo "  make lint               Run linters"
	@echo ""
	@echo "Utility:"
	@echo "  make sample             Create a sample schema file"
	@echo "  make check-docker       Check Docker installation"
	@echo "  make version            Display version information"

# Setup the project
.PHONY: setup
setup: check-docker
	@echo "Setting up NoSQLBench Schema Generator project..."
	@mkdir -p $(BACKEND_DIR)
	@mkdir -p $(FRONTEND_DIR)
	@mkdir -p $(FRONTEND_DIR)/src/components
	@mkdir -p $(FRONTEND_DIR)/public
	@echo "Creating backend files..."
	@if [ -d "setup/backend" ]; then \
		cp -n setup/backend/* $(BACKEND_DIR)/ 2>/dev/null || true; \
	else \
		echo "Setup directory not found. Creating base files..."; \
		$(MAKE) create-backend-files; \
	fi
	@echo "Creating frontend files..."
	@if [ -d "setup/frontend" ]; then \
		cp -n -r setup/frontend/* $(FRONTEND_DIR)/ 2>/dev/null || true; \
	else \
		echo "Setup directory not found. Creating base files..."; \
		$(MAKE) create-frontend-files; \
	fi
	@echo "Creating docker-compose.yml..."
	@if [ -f "setup/docker-compose.yml" ]; then \
		cp -n setup/docker-compose.yml $(PROJECT_DIR)/ 2>/dev/null || true; \
	else \
		$(MAKE) create-docker-compose; \
	fi
	@echo "Setup complete. Run 'make install-deps' to install dependencies."

# Create backend files if they don't exist
.PHONY: create-backend-files
create-backend-files:
	@echo "Creating backend files..."
	@echo 'from fastapi import FastAPI, UploadFile, File, Form, HTTPException\nfrom fastapi.middleware.cors import CORSMiddleware\nfrom fastapi.responses import JSONResponse, StreamingResponse\nfrom typing import List, Dict, Any, Optional\nimport io\nimport zipfile\nimport json\nfrom schema_parser import CQLParser\n\napp = FastAPI(title="NoSQLBench Schema Generator")\n\n# Add CORS middleware\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["*"],  # Adjust in production\n    allow_credentials=True,\n    allow_methods=["*"],\n    allow_headers=["*"],\n)\n\n# Initialize the CQL parser\nparser = CQLParser()\n\n@app.post("/api/parse-schema")\nasync def parse_schema(schema_file: UploadFile = File(...)):\n    """Parse a CQL schema file and return structured information"""\n    if not schema_file.filename.endswith((\'.cql\', \'.txt\')):\n        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .cql or .txt file")\n    \n    content = await schema_file.read()\n    schema_text = content.decode(\'utf-8\')\n    \n    try:\n        schema_info = parser.parse_cql(schema_text)\n        return JSONResponse(content=schema_info)\n    except Exception as e:\n        raise HTTPException(status_code=500, detail=f"Error parsing schema: {str(e)}")\n\n@app.post("/api/generate-yaml")\nasync def generate_yaml(\n    schema_json: str = Form(...),\n    table_selection: str = Form(...),\n):\n    """Generate NoSQLBench YAML files for selected tables"""\n    try:\n        schema_info = json.loads(schema_json)\n        selected_tables = json.loads(table_selection)\n        \n        if not selected_tables:\n            raise HTTPException(status_code=400, detail="No tables selected")\n        \n        # Create a zip file in memory\n        zip_buffer = io.BytesIO()\n        with zipfile.ZipFile(zip_buffer, \'w\', zipfile.ZIP_DEFLATED) as zip_file:\n            for table_name in selected_tables:\n                yaml_content = parser.generate_nosqlbench_yaml(schema_info, table_name)\n                \n                # Clean the table name for the filename\n                safe_name = table_name.replace(\'.\', \'_\')\n                filename = f"{safe_name}.yaml"\n                \n                zip_file.writestr(filename, yaml_content)\n        \n        # Reset buffer position\n        zip_buffer.seek(0)\n        \n        # Return the zip file as a response\n        return StreamingResponse(\n            zip_buffer,\n            media_type="application/zip",\n            headers={"Content-Disposition": "attachment; filename=nosqlbench_yamls.zip"}\n        )\n    except Exception as e:\n        raise HTTPException(status_code=500, detail=f"Error generating YAML files: {str(e)}")\n\n@app.get("/api/health")\nasync def health_check():\n    """Health check endpoint"""\n    return {"status": "healthy"}\n\nif __name__ == "__main__":\n    import uvicorn\n    uvicorn.run(app, host="0.0.0.0", port=8000)' > $(BACKEND_DIR)/main.py
	@echo "from typing import Dict, List, Tuple, Optional, Any, Set\nimport re\n\n\nclass CQLParser:\n    def __init__(self):\n        # Regular expressions for parsing CQL\n        self.keyspace_pattern = re.compile(\n            r\"CREATE\\s+KEYSPACE\\s+(\\w+)\\s+WITH\\s+replication\\s*=\\s*({[^}]+})\\s*(?:AND\\s+durable_writes\\s*=\\s*(true|false))?\",\n            re.IGNORECASE | re.DOTALL\n        )\n        \n        self.table_pattern = re.compile(\n            r\"CREATE\\s+TABLE\\s+(?:if\\s+not\\s+exists\\s+)?(?:(\\w+)\\.)?([\\w-]+)\\s*\\(\\s*([^;]+?)\\s*\\)\\s*(?:WITH[^;]+)?;\",\n            re.IGNORECASE | re.DOTALL\n        )\n        \n        self.type_pattern = re.compile(\n            r\"CREATE\\s+TYPE\\s+(?:if\\s+not\\s+exists\\s+)?(?:(\\w+)\\.)?([\\w-]+)\\s*\\(\\s*([^;]+?)\\s*\\)\\s*;\",\n            re.IGNORECASE | re.DOTALL\n        )\n        \n        self.index_pattern = re.compile(\n            r\"CREATE\\s+INDEX\\s+(?:if\\s+not\\s+exists\\s+)?([\\w-]+)\\s+ON\\s+(?:(\\w+)\\.)?([\\w-]+)\\s*\\(([^)]+)\\);\",\n            re.IGNORECASE | re.DOTALL\n        )\n        \n        self.primary_key_pattern = re.compile(\n            r\"PRIMARY\\s+KEY\\s*\\(\\s*([^)]+)\\s*\\)\",\n            re.IGNORECASE\n        )\n        \n        self.clustering_order_pattern = re.compile(\n            r\"CLUSTERING\\s+ORDER\\s+BY\\s*\\(\\s*([^)]+)\\s*\\)\",\n            re.IGNORECASE\n        )\n\n    def parse_cql(self, cql_content: str) -> Dict[str, Any]:\n        """Parse CQL content and return structured schema information"""\n        result = {\n            \"keyspaces\": {},\n            \"tables\": {},\n            \"types\": {},\n            \"indices\": []\n        }\n        \n        # Extract keyspaces\n        keyspace_matches = self.keyspace_pattern.finditer(cql_content)\n        for match in keyspace_matches:\n            keyspace_name = match.group(1)\n            replication = match.group(2)\n            durable_writes = match.group(3) if match.group(3) else \"true\"\n            \n            result[\"keyspaces\"][keyspace_name] = {\n                \"replication\": replication,\n                \"durable_writes\": durable_writes == \"true\"\n            }\n        \n        # Extract UDTs\n        type_matches = self.type_pattern.finditer(cql_content)\n        for match in type_matches:\n            keyspace_name = match.group(1) if match.group(1) else None\n            type_name = match.group(2)\n            fields_str = match.group(3)\n            \n            fields = {}\n            for field_def in re.split(r\',\\s*(?=\\w+\\s+\\w+)\', fields_str):\n                field_parts = field_def.strip().split(None, 1)\n                if len(field_parts) == 2:\n                    field_name, field_type = field_parts\n                    fields[field_name.strip()] = field_type.strip()\n            \n            if keyspace_name:\n                full_type_name = f\"{keyspace_name}.{type_name}\"\n            else:\n                full_type_name = type_name\n                \n            result[\"types\"][full_type_name] = {\n                \"keyspace\": keyspace_name,\n                \"name\": type_name,\n                \"fields\": fields\n            }\n        \n        # Extract tables\n        table_matches = self.table_pattern.finditer(cql_content)\n        for match in table_matches:\n            keyspace_name = match.group(1) if match.group(1) else None\n            table_name = match.group(2)\n            column_definitions = match.group(3)\n            \n            # Find the WITH clause for this table\n            table_with_clause = self._extract_with_clause(cql_content, keyspace_name, table_name)\n            \n            # Parse columns, primary key, and clustering order\n            columns, primary_key, clustering_order = self._parse_column_definitions(column_definitions)\n            \n            if keyspace_name:\n                full_table_name = f\"{keyspace_name}.{table_name}\"\n            else:\n                full_table_name = table_name\n                \n            result[\"tables\"][full_table_name] = {\n                \"keyspace\": keyspace_name,\n                \"name\": table_name,\n                \"columns\": columns,\n                \"primary_key\": primary_key,\n                \"clustering_order\": clustering_order,\n                \"with_options\": table_with_clause\n            }\n        \n        # Extract indices\n        index_matches = self.index_pattern.finditer(cql_content)\n        for match in index_matches:\n            index_name = match.group(1)\n            keyspace_name = match.group(2) if match.group(2) else None\n            table_name = match.group(3)\n            indexed_columns = match.group(4).strip()\n            \n            if keyspace_name:\n                full_table_name = f\"{keyspace_name}.{table_name}\"\n            else:\n                full_table_name = table_name\n                \n            result[\"indices\"].append({\n                \"name\": index_name,\n                \"table\": full_table_name,\n                \"columns\": indexed_columns\n            })\n        \n        return result\n\n    def _extract_with_clause(self, cql_content: str, keyspace_name: Optional[str], table_name: str) -> Dict[str, Any]:\n        """Extract the WITH clause for a table"""\n        pattern = rf\"CREATE\\s+TABLE\\s+(?:if\\s+not\\s+exists\\s+)?(?:{keyspace_name}\\.)??\\s*{table_name}[^;]+?WITH\\s+([^;]+)\"\n        match = re.search(pattern, cql_content, re.IGNORECASE | re.DOTALL)\n        \n        if not match:\n            return {}\n        \n        with_content = match.group(1)\n        options = {}\n        \n        # Handle nested structures like maps in options\n        current_option = \"\"\n        brace_level = 0\n        \n        for char in with_content + \" AND \":  # Add a separator at the end\n            if char == \'{\':\n                brace_level += 1\n                current_option += char\n            elif char == \'}\':\n                brace_level -= 1\n                current_option += char\n            elif char == \"\\'\" and brace_level > 0:\n                current_option += char\n            elif brace_level == 0 and re.match(r\'\\s+AND\\s+\', char + with_content[with_content.index(char)+1:], re.IGNORECASE):\n                # Found the end of an option\n                if current_option.strip():\n                    key_value = current_option.strip().split(\'=\', 1)\n                    if len(key_value) == 2:\n                        key, value = key_value\n                        options[key.strip()] = value.strip()\n                current_option = \"\"\n            else:\n                current_option += char\n        \n        return options\n\n    def _parse_column_definitions(self, column_defs: str) -> Tuple[Dict[str, str], List[List[str]], Dict[str, str]]:\n        """Parse column definitions, extract primary key and clustering order"""\n        # Extract PRIMARY KEY, if present\n        primary_key_match = self.primary_key_pattern.search(column_defs)\n        primary_key = []\n        if primary_key_match:\n            pk_str = primary_key_match.group(1)\n            # Handle composite partition keys\n            if \'(\' in pk_str:\n                partition_key = re.findall(r\'\\(([^)]+)\\)\', pk_str)\n                if partition_key:\n                    primary_key.append([col.strip() for col in partition_key[0].split(\',\')])\n                    \n                # Extract clustering keys\n                clustering_keys = re.sub(r\'\\([^)]+\\),\\s*\', \'\', pk_str)\n                if clustering_keys:\n                    for col in clustering_keys.split(\',\'):\n                        if col.strip():\n                            primary_key.append([col.strip()])\n            else:\n                # Simple primary key\n                primary_key = [[col.strip()] for col in pk_str.split(\',\')]\n        \n        # Extract CLUSTERING ORDER, if present\n        clustering_order = {}\n        clustering_order_match = self.clustering_order_pattern.search(column_defs)\n        if clustering_order_match:\n            clustering_str = clustering_order_match.group(1)\n            for part in clustering_str.split(\',\'):\n                if \' \' in part:\n                    col, order = part.strip().rsplit(\' \', 1)\n                    clustering_order[col.strip()] = order.strip()\n        \n        # Remove PRIMARY KEY and CLUSTERING ORDER from column definitions\n        clean_column_defs = re.sub(self.primary_key_pattern, \'\', column_defs)\n        clean_column_defs = re.sub(self.clustering_order_pattern, \'\', clean_column_defs)\n        \n        # Extract column names and types\n        columns = {}\n        for col_def in re.split(r\',\\s*(?=\\w+\\s+\\w+)\', clean_column_defs):\n            col_def = col_def.strip()\n            if col_def:\n                parts = col_def.split(None, 1)\n                if len(parts) == 2:\n                    col_name, col_type = parts\n                    columns[col_name.strip()] = col_type.strip()\n        \n        return columns, primary_key, clustering_order\n\n    def map_cql_to_nosqlbench_type(self, cql_type: str) -> str:\n        """Map CQL data types to NoSQLBench binding types"""\n        cql_type = cql_type.lower()\n        \n        if cql_type == \'uuid\':\n            return \'ToHashedUUID()\'\n        elif cql_type == \'timestamp\':\n            return \"AddHashRange(0,2419200000L); StartingEpochMillis(\'2025-01-01 05:00:00\'); ToJavaInstant()\"\n        elif cql_type == \'boolean\':\n            return \'AddCycleRange(0,1); ToBoolean()\'\n        elif cql_type == \'text\' or cql_type == \'varchar\':\n            return \'AlphaNumericString(36)\'\n        elif cql_type == \'decimal\':\n            return \'AddHashRange(0,99999); ToBigDecimal()\'\n        elif cql_type == \'int\':\n            return \'AddHashRange(0,99999); ToInt()\'\n        elif cql_type == \'bigint\':\n            return \'AddHashRange(287854000L,4493779500L)\'\n        elif cql_type == \'double\':\n            return \'AddHashRange(1,10); ToDouble()\'\n        elif cql_type.startswith(\'map<\'):\n            # Extract key and value types from map definition\n            map_types = re.match(r\'map<\\s*([^,]+)\\s*,\\s*([^>]+)\\s*>\', cql_type)\n            if map_types:\n                return \'MapSizedStepped(Mod(7), NumberNameToString(), NumberNameToString())\'\n            return \'MapSizedStepped(Mod(7), NumberNameToString(), NumberNameToString())\'\n        elif cql_type.startswith(\'list<\'):\n            return \'ListSizedStepped(Mod(7), NumberNameToString())\'\n        else:\n            # Default for other types\n            return \'AlphaNumericString(36)\'\n\n    def generate_nosqlbench_yaml(self, cql_schema: Dict[str, Any], table_name: str) -> str:\n        """Generate NoSQLBench YAML for a specific table"""\n        # Find the table in the schema\n        table_info = None\n        for full_name, info in cql_schema[\"tables\"].items():\n            if full_name == table_name or info[\"name\"] == table_name:\n                table_info = info\n                break\n        \n        if not table_info:\n            return f\"# Table {table_name} not found in the schema\"\n        \n        # Determine the keyspace\n        keyspace_name = table_info[\"keyspace\"]\n        \n        # Start building the YAML\n        yaml_content = [\n            \"scenarios:\",\n            \"  default:\",\n            \"    schema1: run driver=cql tags=block:\\\"schema.*\\\" threads===UNDEF cycles==UNDEF\",\n            \"    rampup1: run driver=cql tags=\'block:rampup1\' cycles===TEMPLATE(rampup-cycles,1000000) threads=auto\",\n            \"\",\n            \"bindings:\"\n        ]\n        \n        # Generate bindings based on column types\n        for col_name, col_type in table_info[\"columns\"].items():\n            binding_type = self.map_cql_to_nosqlbench_type(col_type)\n            yaml_content.append(f\"  {col_name} : {binding_type};\")\n        \n        yaml_content.append(\"\")\n        yaml_content.append(\"blocks:\")\n        yaml_content.append(\"  schema1:\")\n        yaml_content.append(\"    params:\")\n        yaml_content.append(\"      prepared: false\")\n        yaml_content.append(\"    ops:\")\n        \n        # Generate the CREATE TABLE statement\n        table_name_only = table_info[\"name\"]\n        full_keyspace_table = f\"{keyspace_name}.{table_name_only}\" if keyspace_name else table_name_only\n        \n        # Create the schema block\n        yaml_content.append(\"      create_table1: | \")\n        yaml_content.append(f\"        CREATE TABLE if not exists <<keyspace:{keyspace_name or \'baselines\'}>>.{table_name_only} (\")\n        \n        # Add column definitions\n        columns_lines = []\n        for col_name, col_type in table_info[\"columns\"].items():\n            columns_lines.append(f\"        {col_name} {col_type},\")\n        \n        # Add primary key\n        if table_info[\"primary_key\"]:\n            pk_parts = []\n            for part in table_info[\"primary_key\"]:\n                if len(part) > 1:  # Composite partition key\n                    pk_parts.append(f\"({', '.join(part)})\")\n                else:\n                    pk_parts.append(part[0])\n            \n            pk_definition = f\"        PRIMARY KEY ({', '.join(pk_parts)})\"\n            columns_lines.append(pk_definition)\n        \n        yaml_content.extend(columns_lines)\n        yaml_content.append(\"        )\")\n        \n        # Add clustering order if present\n        if table_info[\"clustering_order\"]:\n            clustering_parts = []\n            for col, order in table_info[\"clustering_order\"].items():\n                clustering_parts.append(f\"{col} {order}\")\n            \n            yaml_content.append(f\"        WITH CLUSTERING ORDER BY ({', '.join(clustering_parts)});\")\n        else:\n            yaml_content.append(\";\")\n        \n        # Add the rampup block\n        yaml_content.append(\"  rampup1:\")\n        yaml_content.append(\"   params:\")\n        yaml_content.append(\"     cl: ONE #TEMPLATE(write_cl,LOCAL_QUORUM)\")\n        yaml_content.append(\"     instrument: true\")\n        yaml_content.append(\"     prepared: true\")\n        yaml_content.append(\"   ops:\")\n        yaml_content.append(\"     insert_rampup1: |\")\n        \n        # Generate insert statement\n        insert_columns = \", \".join(table_info[\"columns\"].keys())\n        yaml_content.append(f\"          insert into <<keyspace:{keyspace_name or \'baselines\'}>>.{table_name_only} (\")\n        \n        # Add column names for insert\n        for col_name in table_info[\"columns\"].keys():\n            yaml_content.append(f\"          {col_name},\")\n        \n        yaml_content.append(\"          ) values \")\n        yaml_content.append(\"          (\")\n        \n        # Add parameter bindings for insert values\n        for col_name in table_info[\"columns\"].keys():\n            yaml_content.append(f\"          {{{col_name}}},\")\n        \n        yaml_content.append(\"          );\")\n        \n        return \"\\n\".join(yaml_content)" > $(BACKEND_DIR)/schema_parser.py
	@echo "fastapi==0.104.1\nuvicorn==0.23.2\npython-multipart==0.0.6\npydantic==2.4.2\ntyping-extensions==4.8.0" > $(BACKEND_DIR)/requirements.txt

# Create frontend files if they don't exist
.PHONY: create-frontend-files
create-frontend-files:
	@echo "Creating frontend files..."
	@mkdir -p $(FRONTEND_DIR)/src/components $(FRONTEND_DIR)/public
	@echo '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <meta name="theme-color" content="#000000" />\n    <meta\n      name="description"\n      content="NoSQLBench Schema Generator - Generate YAML files from Cassandra schemas"\n    />\n    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />\n    <title>NoSQLBench Schema Generator</title>\n  </head>\n  <body>\n    <noscript>You need to enable JavaScript to run this app.</noscript>\n    <div id="root"></div>\n  </body>\n</html>' > $(FRONTEND_DIR)/public/index.html
	@echo '{\n  "short_name": "NoSQLBench Generator",\n  "name": "NoSQLBench Schema Generator",\n  "icons": [],\n  "start_url": ".",\n  "display": "standalone",\n  "theme_color": "#000000",\n  "background_color": "#ffffff"\n}' > $(FRONTEND_DIR)/public/manifest.json
	@echo 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport "./index.css";\nimport App from "./App";\n\nconst root = ReactDOM.createRoot(\n  document.getElementById("root")\n);\n\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);' > $(FRONTEND_DIR)/src/index.tsx
	@echo '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",\n    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",\n    sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  background-color: #f5f5f5;\n}\n\ncode {\n  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",\n    monospace;\n}' > $(FRONTEND_DIR)/src/index.css
	@echo "{\n  \"name\": \"nosqlbench-schema-generator\",\n  \"version\": \"0.1.0\",\n  \"private\": true,\n  \"dependencies\": {\n    \"@testing-library/jest-dom\": \"^5.16.5\",\n    \"@testing-library/react\": \"^13.4.0\",\n    \"@testing-library/user-event\": \"^13.5.0\",\n    \"@types/jest\": \"^27.5.2\",\n    \"@types/node\": \"^16.18.30\",\n    \"@types/react\": \"^18.2.6\",\n    \"@types/react-dom\": \"^18.2.4\",\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\",\n    \"react-scripts\": \"5.0.1\",\n    \"typescript\": \"^4.9.5\",\n    \"web-vitals\": \"^2.1.4\"\n  },\n  \"scripts\": {\n    \"start\": \"react-scripts start\",\n    \"build\": \"react-scripts build\",\n    \"test\": \"react-scripts test\",\n    \"eject\": \"react-scripts eject\"\n  },\n  \"eslintConfig\": {\n    \"extends\": [\n      \"react-app\",\n      \"react-app/jest\"\n    ]\n  },\n  \"browserslist\": {\n    \"production\": [\n      \">0.2%\",\n      \"not dead\",\n      \"not op_mini all\"\n    ],\n    \"development\": [\n      \"last 1 chrome version\",\n      \"last 1 firefox version\",\n      \"last 1 safari version\"\n    ]\n  },\n  \"devDependencies\": {\n    \"tailwindcss\": \"^3.3.2\",\n    \"autoprefixer\": \"^10.4.14\",\n    \"postcss\": \"^8.4.23\"\n  }\n}" > $(FRONTEND_DIR)/package.json
	@echo "module.exports = {\n  content: [\n    \"./src/**/*.{js,jsx,ts,tsx}\",\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}" > $(FRONTEND_DIR)/tailwind.config.js
	@echo "module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};" > $(FRONTEND_DIR)/postcss.config.js
	@echo 'server {\n    listen 80;\n    server_name localhost;\n\n    location / {\n        root /usr/share/nginx/html;\n        index index.html index.htm;\n        try_files $uri $uri/ /index.html;\n    }\n\n    # Proxy API requests to the backend\n    location /api/ {\n        proxy_pass http://backend:8000/api/;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection \'upgrade\';\n        proxy_set_header Host $host;\n        proxy_cache_bypass $http_upgrade;\n    }\n}' > $(FRONTEND_DIR)/nginx.conf

# Create docker-compose if it doesn't exist
.PHONY: create-docker-compose
create-docker-compose:
	@echo "Creating docker-compose.yml..."
	@echo 'version: "3.8"\n\nservices:\n  backend:\n    build:\n      context: ./backend\n      dockerfile: Dockerfile\n    container_name: nosqlbench-generator-backend\n    ports:\n      - "8000:8000"\n    networks:\n      - app-network\n    restart: unless-stopped\n\n  frontend:\n    build:\n      context: ./frontend\n      dockerfile: Dockerfile\n    container_name: nosqlbench-generator-frontend\n    ports:\n      - "80:80"\n    depends_on:\n      - backend\n    networks:\n      - app-network\n    restart: unless-stopped\n\nnetworks:\n  app-network:\n    driver: bridge' > $(PROJECT_DIR)/docker-compose.yml

# Create Dockerfiles
.PHONY: create-dockerfiles
create-dockerfiles: setup
	@echo "Creating Dockerfiles..."
	@echo 'FROM python:3.9-slim\n\nWORKDIR /app\n\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nCOPY schema_parser.py .\nCOPY main.py .\n\nEXPOSE 8000\n\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]' > $(BACKEND_DIR)/Dockerfile
	@echo 'FROM node:18-alpine as build\n\nWORKDIR /app\n\nCOPY package.json package-lock.json ./\nRUN npm install\n\nCOPY . ./\nRUN npm run build\n\n# Production environment\nFROM nginx:alpine\n\n# Copy built app to nginx\nCOPY --from=build /app/build /usr/share/nginx/html\n\n# Copy nginx config\nCOPY nginx.conf /etc/nginx/conf.d/default.conf\n\nEXPOSE 80\n\nCMD ["nginx", "-g", "daemon off;"]' > $(FRONTEND_DIR)/Dockerfile

# Install all dependencies
.PHONY: install-deps
install-deps: install-backend-deps install-frontend-deps

# Install backend dependencies
.PHONY: install-backend-deps
install-backend-deps:
	@echo "Installing backend dependencies..."
	@cd $(BACKEND_DIR) && $(PIP) install -r requirements.txt

# Install frontend dependencies
.PHONY: install-frontend-deps
install-frontend-deps:
	@echo "Installing frontend dependencies..."
	@cd $(FRONTEND_DIR) && $(NPM) install

# Start the application with Docker
.PHONY: start
start: check-docker
	@echo "Starting NoSQLBench Schema Generator..."
	@$(DOCKER_COMPOSE) up -d
	@echo "Application started. Visit http://localhost to access the web interface."

# Stop the application
.PHONY: stop
stop:
	@echo "Stopping NoSQLBench Schema Generator..."
	@$(DOCKER_COMPOSE) down
	@echo "Application stopped."

# Restart the application
.PHONY: restart
restart: stop start

# Build the project
.PHONY: build
build: check-docker
	@echo "Building NoSQLBench Schema Generator..."
	@$(DOCKER_COMPOSE) build
	@echo "Build complete."

# Clean the project
.PHONY: clean
clean: stop
	@echo "Cleaning NoSQLBench Schema Generator..."
	@$(DOCKER_COMPOSE) down -v
	@rm -rf $(FRONTEND_DIR)/build
	@rm -rf $(FRONTEND_DIR)/node_modules
	@find $(BACKEND_DIR) -type d -name "__pycache__" -exec rm -rf {} +
	@echo "Clean complete."

# Show container logs
.PHONY: logs
logs:
	@$(DOCKER_COMPOSE) logs -f

# Start development environment
.PHONY: dev
dev:
	@echo "Starting development environment..."
	@make dev-backend & make dev-frontend

# Start backend development server
.PHONY: dev-backend
dev-backend:
	@echo "Starting backend development server..."
	@cd $(BACKEND_DIR) && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start frontend development server
.PHONY: dev-frontend
dev-frontend:
	@echo "Starting frontend development server..."
	@cd $(FRONTEND_DIR) && $(NPM) start

# Run tests
.PHONY: test
test: test-backend test-frontend

# Run backend tests
.PHONY: test-backend
test-backend:
	@echo "Running backend tests..."
	@cd $(BACKEND_DIR) && pytest -v

# Run frontend tests
.PHONY: test-frontend
test-frontend:
	@echo "Running frontend tests..."
	@cd $(FRONTEND_DIR) && $(NPM) test

# Run linters
.PHONY: lint
lint: lint-backend lint-frontend

# Lint backend code
.PHONY: lint-backend
lint-backend:
	@echo "Linting backend code..."
	@cd $(BACKEND_DIR) && flake8

# Lint frontend code
.PHONY: lint-frontend
lint-frontend:
	@echo "Linting frontend code..."
	@cd $(FRONTEND_DIR) && $(NPM) run lint

# Create a sample schema file
.PHONY: sample
sample:
	@echo "Creating sample schema file..."
	@mkdir -p samples
	@cat > samples/sample_schema.cql << 'EOF'
CREATE KEYSPACE test_keyspace WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '3'} AND durable_writes = true;

CREATE TABLE test_keyspace.users (
    user_id uuid,
    username text,
    email text,
    created_at timestamp,
    active boolean,
    last_login timestamp,
    PRIMARY KEY (user_id)
);


CREATE TABLE test_keyspace.posts (
    post_id uuid,
    user_id uuid,
    title text,
    content text,
    created_at timestamp,
    tags set<text>,
    likes int,
    PRIMARY KEY (post_id, created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);

CREATE TABLE test_keyspace.comments (
    post_id uuid,
    comment_id uuid,
    user_id uuid,
    content text,
    created_at timestamp,
    PRIMARY KEY ((post_id), comment_id, created_at)
) WITH CLUSTERING ORDER BY (comment_id ASC, created_at DESC);
EOF
	@echo "Sample schema file created at samples/sample_schema.cql"

# Check Docker installation
.PHONY: check-docker
check-docker:
	@echo "Checking Docker installation..."
	@if ! command -v docker &> /dev/null; then \
		echo "Error: Docker is not installed. Please install Docker and try again."; \
		exit 1; \
	fi
	@if ! command -v docker-compose &> /dev/null; then \
		echo "Error: Docker Compose is not installed. Please install Docker Compose and try again."; \
		exit 1; \
	fi
	@echo "Docker is installed."

# Display version information
.PHONY: version
version:
	@echo "NoSQLBench Schema Generator"
	@echo "Version: 1.0.0"
	@echo "Docker version: $(shell docker --version)"
	@echo "Docker Compose version: $(shell docker-compose --version)"
	@echo "Python version: $(shell $(PYTHON) --version)"
	@echo "Node.js version: $(shell node --version 2>/dev/null || echo 'Node.js not installed')"
	@echo "npm version: $(shell $(NPM) --version 2>/dev/null || echo 'npm not installed')"