Don't push virtual environment to repository !! 
_______________________________________________
Set up virtual environment:  
1) git clone < repository url >  
2) cd < cloned repository >  
3) python3 -m venv < name you want for venv >  
4) source < name you want for venv >/bin/activate  
5) pip install -r requirements.txt  
_______________________________________________
Run Server:  
1) source venv/bin/activate  
2) cd firstTry  
3) python3 manage.py runserver
_______________________________________________
Managing Staticfiles:  
1) python3 manage.py collectstatic  
_______________________________________________
to configure a PostgreSQL database:  
1) sudo apt update && sudo apt install postgresql postgresql-contrib  
2) sudo systemctl start postgresql  
3) sudo -u postgres psql  
4) In PostgreSQL prompt:  
CREATE DATABASE transcend_db;  
CREATE USER db_user WITH PASSWORD 'He11oWorld';  
GRANT ALL PRIVILEGES ON DATABASE transcend_db TO db_user;  
\c transcend_db  
GRANT ALL PRIVILEGES ON SCHEMA public TO your_database_user;  
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_database_user;  
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO your_database_user;  
\q  
5) to verify:  
psql -U db_user -d transcend_db -h 127.0.0.1 -W  
Enter He11oWorld for the password  
If everything is set up correctly, you should be able to access the transcend_db database as db_user.  
6) access your virtual environment  
7)  pip install psycopg2-binary  
8) python manage.py makemigrations (use python3 if python doesn't work)  
9) python manage.py migrate  
10) python manage.py showmigrations  (to verify)  
________________________________________________
( saving needed dependencies for project from env ( not sure ) )  
1) pip freeze > requirements.txt
