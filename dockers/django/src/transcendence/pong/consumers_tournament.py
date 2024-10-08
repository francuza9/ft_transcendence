from channels.generic.websocket import AsyncWebsocketConsumer
from .models import CustomUser, Profile
from asgiref.sync import sync_to_async
import json
import random
import string
import logging
import asyncio

logger = logging.getLogger(__name__)

tournament_states = {}

class TournamentConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		try:
			self.lobby_id = self.scope['url_route']['kwargs'].get('lobbyId')
			logger.info(f"tournament: WebSocket connection accepted for lobby {self.lobby_id}")
			query_params = self.scope['query_string'].decode()
			self.username = next((param.split('=')[1] for param in query_params.split('&') if param.startswith('username=')), None)

			if self.lobby_id not in tournament_states:
				tournament_states[self.lobby_id] = {
					'connections': 0,
					'players': None,
					'pairs': [],
					'results': [],
					'player_connections': {},
					'ran': False,
					'lobbies': {},
					'self': self,
				}

			tournament_state = tournament_states[self.lobby_id]
			user = self.scope['user']
			if user.is_authenticated:
				tournament_state['connections'] += 1
				tournament_state['player_connections'][self.username] = self
				await self.accept()
			else:
				await self.close()

		except Exception as e:
			logger.error(f"Error during connection setup: {e}")
			await self.close()

	async def disconnect(self, close_code):
		try:
			if self.lobby_id in tournament_states:
				tournament_state = tournament_states[self.lobby_id]
				tournament_state['connections'] -= 1
				if self.username in tournament_state['player_connections']:
					del tournament_state['player_connections'][self.username]

				if tournament_state['connections'] == 0:
					del tournament_states[self.lobby_id]

		except Exception as e:
			logger.error(f"Error during disconnection: {e}")

	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get('type')
		content = data.get('content')
		first_time_flag = True

		if message_type == 'init':
			if not tournament_states[self.lobby_id]['ran']:
				tournament_states[self.lobby_id]['ran'] = True
				tournament_states[self.lobby_id]['players'] = content
				while True:
					if not tournament_states[self.lobby_id]['pairs']:
						tournament_states[self.lobby_id]['pairs'] = await self.generate_pairs(tournament_states[self.lobby_id]['players'])
					await self.send_matchups(first_time_flag)
					if first_time_flag:
						await asyncio.sleep(8)
					else:
						await asyncio.sleep(5)
					first_time_flag = False
					if len([player for player, is_bot in tournament_states[self.lobby_id]['players'].items() if not is_bot]) <= tournament_states[self.lobby_id]['connections']:
						await self.start_tournament()
					while True:
						if len(tournament_states[self.lobby_id]['results']) == len(tournament_states[self.lobby_id]['pairs']):
							temp_list = {}
							if len(tournament_states[self.lobby_id]['results']) == 1:
								break
							for i in tournament_states[self.lobby_id]['results']:
								temp_list.update(i)
							tournament_states[self.lobby_id]['players'] = temp_list
							tournament_states[self.lobby_id]['pairs'] = []
							tournament_states[self.lobby_id]['results'] = []
							break
						else:
							await asyncio.sleep(1)
					if len(tournament_states[self.lobby_id]['results']) == 1:
						logger.info(f"Winner: {tournament_states[self.lobby_id]['results']}")
						original_key = list(tournament_states[self.lobby_id]['results'][0].keys())[0]
						nick = await self.getDispFromDB(original_key)
						if nick != "":
							result_dict = tournament_states[self.lobby_id]['results'][0]
							updated_result_dict = {nick: result_dict.pop(original_key)}
							tournament_states[self.lobby_id]['results'][0] = updated_result_dict
						await self.send_end_message()
						break


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

	async def start_tournament(self):
		tournament_state = tournament_states[self.lobby_id]
		tournament_state['lobbies'] = {}
		for pair in tournament_state['pairs']:
			usernames = list(pair.keys())
			is_bots = [pair[username] for username in usernames]

			if all(is_bots):
				winner_username = random.choice(usernames)
				winner = {winner_username: pair[winner_username]}
				if winner not in tournament_state['results']:
					tournament_state['results'].append(winner)
			else:
				lobby_id = await self.generate_lobby_id()
				aiGame = False
				botName = None
				for i in range(2):
					if not is_bots[i]:
						tournament_state['lobbies'][usernames[i]] = lobby_id
				for i in range(2):
					if is_bots[i]:
						botName = usernames[i]
						aiGame = True
						break
				await self.send_to_pair(usernames, lobby_id, aiGame, botName)

	async def send_matchups(self, first_time_flag=False):
		tournament_state = tournament_states[self.lobby_id]

		await asyncio.sleep(0.5)
		display_name_pairs = await self.get_display_name_pairs(tournament_state['pairs'])

		message = {
			'type': 'matchups',
			'content': {
				'matchups': tournament_state['pairs'],
				'displays': display_name_pairs,
				'firstTime': first_time_flag,
			}
		}
		for username, connection in tournament_state['player_connections'].items():
			await connection.send(text_data=json.dumps(message))

	async def get_display_name_pairs(self, pairs):
		display_name_pairs = []
		for pair in pairs:
			new_pair = {}
			for username, is_bot in pair.items():
				display_name = await self.getDispFromDB(username)
				if display_name == "":
					display_name = username
				new_pair[display_name] = is_bot
			display_name_pairs.append(new_pair)
		return display_name_pairs

	async def send_end_message(self):
		tournament_state = tournament_states[self.lobby_id]

		winner = list(tournament_state['results'][0].keys())[0]

		message = {
			'type': 'winner',
			'content': {
				'winner': winner,
			}
		}

		for username, connection in tournament_state['player_connections'].items():
			await connection.send(text_data=json.dumps(message))


	async def send_to_pair(self, usernames, lobby_id, aiGame, botName):
		tournament_state = tournament_states[self.lobby_id]
		admin = True
		for username in usernames:
			if username in tournament_state['player_connections']:
				connection = tournament_state['player_connections'][username]
				await connection.send(text_data=json.dumps({
					'type': 'start',
					'content': {
						'lobbyId': lobby_id,
						'players': usernames,
						'aiGame': aiGame,
						'botName': botName,
						'admin': admin,
					}
				}))
			admin = False

	async def generate_lobby_id(self):
		return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

	async def getDispFromDB(self, target):
		try:
			user = await sync_to_async(CustomUser.objects.get)(username=target)
			
			profile = await sync_to_async(Profile.objects.get)(user=user)

			display_name = profile.displayName
		except CustomUser.DoesNotExist:
			logger.info("User not found")
			display_name = ""
		except Profile.DoesNotExist:
			logger.info("Profile not found for user")
			display_name = ""
		except Exception as e:
			logger.error(f"Error fetching profile: {e}")
			display_name = ""
			
		return display_name
