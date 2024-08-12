all: down
	docker-compose up --build -d

down:
	docker-compose down

clean: down
	@echo "Removing Docker images..."
	docker image prune -af

fclean: clean
	@echo "Removing Docker images and cache..."
	docker system prune

re: clean all

.PHONY: all languages clean down re
