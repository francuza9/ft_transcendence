all:
	python3 -m venv myenv
	. myenv/bin/activate && pip install -r requirements.txt
	echo "myenv/" >> .gitignore

run:
	. myenv/bin/activate && cd firstTry && python3 manage.py collectstatic --noinput
	. myenv/bin/activate && cd firstTry && python3 manage.py runserver

push:
	git add *
	git commit -m "$(msg)"
	git push
