FROM python:3.9-slim

WORKDIR /code

COPY src/requirements.txt /code/

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get update \
    && apt-get install -y netcat-openbsd gettext\
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY src /code/

RUN chmod +x scripts/django_setup.sh

EXPOSE 8000

ENTRYPOINT ["sh", "/code/scripts/django_setup.sh" ]

CMD ["python3", "transcendence/manage.py", "runserver", "0.0.0.0:8000"]
