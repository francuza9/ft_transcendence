# Use the official PostgreSQL image
FROM postgres:13

# Copy the initialization script into the Docker image
COPY init-db.sql /docker-entrypoint-initdb.d/
