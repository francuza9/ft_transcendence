FROM python:3.9-slim

WORKDIR /code

COPY src/requirements.txt /code/

RUN pip install --upgrade pip\
	&& pip install django \
	&& pip install --no-cache-dir -r requirements.txt
	

COPY src /code/

# COPY scripts/wait-for-it.sh /wait-for-it.sh
# RUN chmod +x /wait-for-it.sh

# COPY scripts/test.sh /code/
RUN chmod +x scripts/test.sh

EXPOSE 8000

ENTRYPOINT ["sh", "/code/scripts/test.sh" ]

CMD ["python3", "firstTry/manage.py", "runserver", "0.0.0.0:8000"]
