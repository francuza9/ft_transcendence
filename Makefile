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

annihilate: fclean
	@echo "Removing Docker networks..."
	docker network prune -f
	@echo "Removing Docker volumes..."
	docker volume prune -f
	docker volume rm $$(docker volume ls -q) || true


re: annihilate all

.PHONY: all languages clean down re
