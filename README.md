Don't push virtual environment to repository !! 

Set up virtual environment:  
    1) git clone < repository url >  
    2) cd < cloned repository >  
    3) python3 -m venv < name you want for venv >  
    4) source < name you want for venv >/bin/activate  
    5) pip install -r requirements.txt  
<br>
Run Server:  
    1) source venv/bin/activate  
    2) cd firstTry  
    3) uvicorn firstTry.asgi:application --reload --port 8000  
<br>
Managing Staticfiles:  
on every change for uvicorn to see changes this command needs to be run.  
    python3 manage.py collectstatic  
<br>
( saving needed dependencies for project from env ( not sure ) )  
pip freeze > requirements.txt
