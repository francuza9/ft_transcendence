#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 1
done

echo "PostgreSQL is up - running migrations."

# Apply database migrations
rm -rf transcendence/migrations/00*
python3 transcendence/manage.py makemigrations
python3 transcendence/manage.py migrate
python3 transcendence/manage.py populate_data
# Start the Django development server
exec "$@"
