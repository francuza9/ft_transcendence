from channels.generic.websocket import AsyncWebsocketConsumer
import json
import random
import string
import logging

logger = logging.getLogger(__name__)

tournament_states = {}

class TournamentConsumer(AsyncWebsocketConsumer):
    max_connections = 8
    coordinator_username = None  # Store the coordinator username

    async def connect(self):
        if not hasattr(self, 'tournament_state'):
            self.tournament_state = {
                'connections': 0,
                'players': None,
                'pairs': [],
                'results': [],
                'player_connections': {},
            }

        lobby_id = self.scope['url_route']['kwargs'].get('lobbyId')
        query_params = self.scope['query_string'].decode()
        username = next((param.split('=')[1] for param in query_params.split('&') if param.startswith('username=')), None)

        if self.tournament_state['connections'] >= self.max_connections:
            await self.close()
        else:
            user = self.scope['user']
            if user.is_authenticated:
                self.username = username
                self.tournament_state['connections'] += 1
                self.tournament_state['player_connections'][self.username] = self
                if not self.coordinator_username:
                    self.coordinator_username = self.username  # Designate the first authenticated user as coordinator
                await self.accept()
            else:
                await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'tournament_state'):
            self.tournament_state['connections'] -= 1
            username = self.scope['user'].username
            if username in self.tournament_state['player_connections']:
                del self.tournament_state['player_connections'][username]
            if username == self.coordinator_username and self.tournament_state['connections'] > 0:
                # Reassign a new coordinator if the current one disconnects
                self.coordinator_username = next(iter(self.tournament_state['player_connections']), None)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        content = data.get('content')

        if message_type == 'init':
            if self.tournament_state['players'] is None:
                self.tournament_state['players'] = content
                self.tournament_state['pairs'] = self.generate_pairs(content)
                await self.start_tournament()
                await self.send(text_data=json.dumps({
                    'type': 'init_acknowledged',
                    'content': self.tournament_state['pairs']
                }))

    def generate_pairs(self, players):
        player_list = [(username, is_bot) for username, is_bot in players.items()]
        matchups = []
        for i in range(0, len(player_list), 2):
            if i + 1 < len(player_list):
                pair = {
                    player_list[i][0]: player_list[i][1],
                    player_list[i + 1][0]: player_list[i + 1][1]
                }
                matchups.append(pair)
        return matchups

    async def start_tournament(self):
        if self.username == self.coordinator_username:
            for pair in self.tournament_state['pairs']:
                usernames = list(pair.keys())
                is_bots = [pair[username] for username in usernames]

                if all(is_bots):
                    winner = random.choice(usernames)
                    self.tournament_state['results'].append(winner)
                else:
                    lobby_id = await self.generate_lobby_id()
                    logger.info(f'Generated lobby_id: {lobby_id} for pair: {usernames}')
                    await self.send_to_pair(usernames, lobby_id)

    async def send_to_pair(self, usernames, lobby_id):
        for username in usernames:
            if username in self.tournament_state['player_connections']:
                connection = self.tournament_state['player_connections'][username]
                await connection.send(text_data=json.dumps({
                    'type': 'start',
                    'content': lobby_id
                }))

    async def generate_lobby_id(self):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=8))
