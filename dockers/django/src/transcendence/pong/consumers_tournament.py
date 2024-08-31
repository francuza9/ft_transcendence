from channels.generic.websocket import AsyncWebsocketConsumer
import json
import itertools

class TournamentConsumer(AsyncWebsocketConsumer):
	max_connections = 8

	async def connect(self):
		if not hasattr(self, 'tournament_state'):
			self.tournament_state = {
				'connections': 0,
				'players': None,
				'pairs': [],
			}
		if self.tournament_state['connections'] >= self.max_connections:
			await self.close()
		else:
			await self.accept()
			self.tournament_state['connections'] += 1

	async def disconnect(self, close_code):
		if hasattr(self, 'tournament_state'):
			self.tournament_state['connections'] -= 1

	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get('type')
		content = data.get('content')

		if message_type == 'init':
			if self.tournament_state['players'] is None:
				self.tournament_state['players'] = content
				self.tournament_state['pairs'] = await self.generate_pairs(content)
				await self.send(text_data=json.dumps({
					'type': 'init_acknowledged',
					'content': self.tournament_state['pairs']
				}))

	async def generate_pairs(self, players):
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
