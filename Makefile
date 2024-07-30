all:
	docker-compose up --build

run:
	. myenv/bin/activate && cd dockers/src/firstTry && python3 manage.py collectstatic --noinput
	. myenv/bin/activate && cd dockers/src/firstTry && python3 manage.py runserver

push:
	git add *
	git commit -m "$(msg)"
	git push

down:
	docker-compose down

clean: down
	@echo "Stopping and removing containers..."
	docker-compose -p $(PROJECT_NAME) down || true

	@echo "Removing Docker networks..."
	docker network prune -f

	@echo "Removing Docker volumes..."
	docker volume prune -f
	docker volume rm $$(docker volume ls -q) || true

	@echo "Removing unused Docker build cache..."
	docker builder prune -af

	@echo "Removing cache..."
	docker system prune -f

	@echo "Cleaning up dangling images..."
	docker rmi $(docker images -f "dangling=true" -q) || true

	@echo "Stopping NGINX..."
	sudo systemctl stop nginx || true

	@echo "Cleanup completed."

fclean: clean
	@echo "Removing Docker images..."
	docker image prune -af

re: clean all

.PHONY: all run push clean down re
