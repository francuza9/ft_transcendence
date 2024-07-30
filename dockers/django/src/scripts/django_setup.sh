#!/bin/sh

# Wait for PostgreSQL to be ready
# echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 1
done

echo "PostgreSQL is up - running migrations."

# Apply database migrations
python3 firstTry/manage.py makemigrations
python3 firstTry/manage.py migrate
python3 firstTry/manage.py collectstatic --noinput

# Start the Django development server
exec "$@"
