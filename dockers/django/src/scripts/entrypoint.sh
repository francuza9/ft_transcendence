#!/bin/sh

set -e  # Exit immediately if a command exits with a non-zero status

python3 firstTry/manage.py makemigrations
python3 firstTry/manage.py migrate
python3 firstTry/manage.py runserver 0.0.0.0:8000
