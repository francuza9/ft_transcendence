Don't push virtual environment to repository !! 

Set up virtual environment:
1) git clone < repository url >
2) cd < cloned repository >
3) python3 -m venv < name you want for venv >
4) source < name you want for venv >/bin/activate
5) pip install -r requirements.txt

( saving needed dependencies for project from env ( not sure ) )
pip freeze > requirements.txt
