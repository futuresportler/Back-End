# Back-End

To view the file structure, use the following command:

```bash
find . -type d \( -name "node_modules" -o -name ".git" \) -prune -o -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'
```

---

```markdown
# 📘 PostgreSQL psql Command Cheatsheet – Future Sportler Edition

Your official survival guide for slaying databases, flipping schemas, and ruling roles — all from the psql shell. Let’s gooo. 🚀

---

## 🔄 Switching Databases & Users

\c <database_name>              -- Switch to another database
\c <database_name> <username>   -- Connect as another user
```

---

## 🧑‍💻 User & Role Management

```sql
\du                             -- List all roles (users)
CREATE ROLE badri WITH LOGIN PASSWORD '1422';
ALTER ROLE badri CREATEDB;      -- Give DB creation power
GRANT ALL PRIVILEGES ON DATABASE sportTable TO badri;
DROP ROLE badri;                -- Bye bye user
```

---

## 🏦 Database Management

```sql
\l                              -- List all databases
CREATE DATABASE sportTable;
DROP DATABASE sportTable;  -- Deletes DB completely 😬
```

### 🔁 Resetting / Nuking a Database

Inside `psql` (useful if DROP is locked):
```sql
-- Drop all tables (danger zone)
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
```

Outside `psql`, in your shell:
```bash
# Drop and recreate the database (clean slate)
psql -U postgres -c "DROP DATABASE future_sportler;"
psql -U postgres -c "CREATE DATABASE future_sportler;"
```

---

## 🧠 Schema Operations

```sql
\dn                             -- List all schemas
SET search_path TO <schema>;    -- Switch active schema
CREATE SCHEMA analytics;
DROP SCHEMA analytics CASCADE; -- Destroys schema + all its objects
```

---

## 📋 Table Operations

```sql
\dt                             -- List all tables in current schema
\dt <schema>.*                  -- List tables in specific schema
\d <table_name>                 -- Show table structure
\d+ <table_name>                -- Table structure with extra info
TRUNCATE <table_name>;          -- Delete all data, keep structure
DROP TABLE <table_name>;        -- Delete table completely
DROP TABLE IF EXISTS <table_name> CASCADE;
```

---

## 🧪 Downloading Geometry Package into DB

```bash
sudo apt update
sudo apt install postgis postgresql-16-postgis-3
sudo systemctl restart postgresql
psql -U postgres -d sportTable -c "CREATE EXTENSION postgis;"
```

---

## 🛠 Utilities & Debugging

```sql
\x                              -- Toggle expanded table view
\t                              -- Toggle table formatting
\i /path/to/file.sql            -- Run SQL script
\q                              -- Quit psql
\?                              -- Help for psql commands
\h <command>                    -- Help for SQL syntax (e.g., \h CREATE TABLE)
```

---

## 🧨 Full Nuke Combo (Dangerous)

```bash
# WARNING: Deletes and resets your entire database
psql -U postgres -c "DROP DATABASE IF EXISTS future_sportler;"
psql -U postgres -c "CREATE DATABASE future_sportler;"
```

---

## 💡 Example Workflow

```bash
psql -U postgres -d sportTable -W
```
\c sportTable                      -- Switch to your project DB
\dt                                -- List all tables
\dn                                -- List schemas
\du                                -- View roles
TRUNCATE users RESTART IDENTITY;  -- Empty table & reset serial ID
```

---