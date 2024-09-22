# Transcendence

## Project Overview

**Transcendence** is a remote Pong website featuring a robust backend built with Django and a dynamic frontend utilizing JavaScript, HTML, and CSS, including the THREE.js library. The application is designed for seamless gameplay and interaction, offering various user features and functionalities.

## Architecture

- **Backend**: Django
- **Frontend**: JavaScript, HTML, CSS, THREE.js
- **Web Server**: Nginx (for TLS, reverse proxy, and serving static files)
- **Database**: PostgreSQL
- **Containerization**: Docker (using Docker Compose)

## Features

- **User Management**: Registration, login, and profile management.
- **Chat System**: Real-time chat functionality for users.
- **Friends System**: Add, remove, block, and unfriend users.
- **Active Status**: Display user activity in real time.
- **HTTPS Protocol**: Secure communication over the network.
- **Translations**: Support for multiple languages.
- **Game Modes**:
  - 1v1 Local Game
  - 1v1 Remote Game
  - Remote Tournament System with Matchmaking
  - Multiplayer Remote Game (up to 8 players)
  - Versus AI with 4 difficulty levels (one found in tournaments)

## Getting Started

### Prerequisites

- Docker must be installed on your machine.

### Running the Application

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd transcendence
2. Use the provided Makefile to run the server:
   ```bash
   make
## Clearing Up
- To remove temporary files and resources, run:
  ```bash
  make clean
- To clear all resources, including Docker volumes, use:
  ```bash
  make annihilate
