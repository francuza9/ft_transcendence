FROM python:3.9-slim

WORKDIR /code

COPY src/requirements.txt /code/

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get update \
    && apt-get install -y netcat-openbsd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y netcat-openbsd

COPY src /code/

RUN chmod +x scripts/django_setup.sh

EXPOSE 8000

ENTRYPOINT ["sh", "/code/scripts/django_setup.sh" ]

CMD ["python3", "transcendence/manage.py", "runserver", "0.0.0.0:8000"]


# FROM python:3.9-slim

# WORKDIR /code

# COPY src/requirements.txt /code/

# RUN pip install --upgrade pip\
# 	&& pip install django\
# 	&& pip install --no-cache-dir -r requirements.txt

# RUN apt-get update && apt-get install -y netcat-openbsd

# COPY src /code/

# RUN chmod +x scripts/django_setup.sh

# EXPOSE 8000

# ENTRYPOINT ["sh", "/code/scripts/django_setup.sh" ]

# CMD ["python3", "transcendence/manage.py", "runserver", "0.0.0.0:8000"]

