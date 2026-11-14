# ft_transcendence

A multiplayer Pong website: play locally, online against other people, in tournaments or against an AI, with accounts, friends and live chat. The final project of the École 42 common core, built by a team of four.

## Features

- **Game modes**: 1v1 on one keyboard, 1v1 online, multiplayer online (up to 8 players), remote tournaments with matchmaking, and an AI opponent with 4 difficulty levels
- **3D rendering** of the game in the browser with THREE.js
- **Accounts**: registration, login and profiles
- **Social**: friends, blocking, online status in real time and live chat
- **Translations** into several languages
- **HTTPS** end to end

## Architecture

| Part | Technology |
|---|---|
| Backend | Django (Python) |
| Real-time | WebSockets for games, chat and presence |
| Frontend | JavaScript, HTML, CSS, THREE.js (single-page app) |
| Web server | Nginx: TLS, reverse proxy and static files |
| Database | PostgreSQL |
| Deployment | Docker Compose, one container per service |

## What it took

- Designing a backend that keeps game state authoritative while several clients play over the network
- Real-time communication with WebSockets: games, chat and presence on one server
- A game loop, physics and an AI opponent that behaves differently at each difficulty level
- Matchmaking and tournament brackets
- Authentication, sessions and basic web security (TLS, input validation)
- Containerising a multi-service app and wiring Nginx, Django and PostgreSQL together
- Working as a team of four on one codebase with Git

## Running it

Requires Docker.

```bash
git clone https://github.com/francuza9/ft_transcendence.git
cd ft_transcendence
make            # build and start every container
make clean      # stop them
make annihilate # remove containers, images and volumes
```
