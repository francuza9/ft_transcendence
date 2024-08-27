from channels.generic.websocket import AsyncWebsocketConsumer
from .ai import AI
import json
import logging
import asyncio
import random

logger = logging.getLogger(__name__)

lobby_data = {}

import os

file_path = os.path.join(os.path.dirname(__file__), 'bot_names.json')
with open(file_path, 'r') as file:
	bot_names = json.load(file)

class LobbyConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		try:
			self.lobby_id = self.scope['url_route']['kwargs']['lobbyId']
			self.lobby_group_name = f"lobby_{self.lobby_id}"

			if self.lobby_id not in lobby_data:
				logger.info(f"lobby: lobby_data: {lobby_data}")
				lobby_data[self.lobby_id] = {
					'admin': None,
					'map': "default_map",
					'max_users': 10,
					'players': [],
					'is_bot': [],
					'is_tournament': False,
					'room_name': "default_room_name",
					'connected_clients': set(),
					'winning_score': 999,
					'difficulty': None,
					'aiGame': False
				}

			lobby_data[self.lobby_id]['connected_clients'].add(self.channel_name)

			await self.channel_layer.group_add(
				self.lobby_group_name,
				self.channel_name
			)
			await self.accept()
			# await self.send_refresh_message() # maybe remove this
			logger.info(f"lobby: WebSocket connection accepted for lobby {self.lobby_id}")

		except Exception as e:
			logger.error(f"Error during connection setup: {e}")
			await self.close()

	async def disconnect(self, close_code):
		logger.info(f"lobby: Disconnect called with code: {close_code}")

		if self.lobby_id in lobby_data:
			lobby_data[self.lobby_id]['connected_clients'].discard(self.channel_name)

			if not lobby_data[self.lobby_id]['connected_clients']:
				await asyncio.sleep(10)
				if not lobby_data[self.lobby_id]['connected_clients']:
					del lobby_data[self.lobby_id]
					logger.info(f"lobby: Lobby {self.lobby_id} removed due to inactivity.")

		await self.channel_layer.group_discard(
			self.lobby_group_name,
			self.channel_name
		)

		if self.lobby_id in lobby_data:
			await self.send_refresh_message()

		logger.info(f"lobby: WebSocket connection closed with code: {close_code} for lobby {self.lobby_id}")

	async def receive(self, text_data=None):
		if text_data:
			data = json.loads(text_data)
			message_type = data.get('type')
			content = data.get('content')

			logger.info(f"lobby: message type: {message_type}")

			if message_type == 'init':
				username = content.get('username')
				if lobby_data[self.lobby_id]['admin'] is None:
					lobby_data[self.lobby_id]['admin'] = username
				if username not in lobby_data[self.lobby_id]['players'] and len(lobby_data[self.lobby_id]['players']) < lobby_data[self.lobby_id]['max_users']:
					lobby_data[self.lobby_id]['players'].append(username)
					lobby_data[self.lobby_id]['is_bot'].append(False)  # Assuming the player is not a bot
				else:
					self.redirect_message()

				if lobby_data[self.lobby_id]['admin'] == username and lobby_data[self.lobby_id]['max_users'] == 10:
					lobby_data[self.lobby_id]['map'] = content.get('map')
					lobby_data[self.lobby_id]['max_users'] = content.get('maxPlayerCount')
					lobby_data[self.lobby_id]['room_name'] = content.get('roomName')
					lobby_data[self.lobby_id]['is_tournament'] = content.get('isTournament')
					lobby_data[self.lobby_id]['winning_score'] = content.get('pointsToWin')
					lobby_data[self.lobby_id]['difficulty'] = content.get('AIDifficulty')
					lobby_data[self.lobby_id]['aiGame'] = content.get('aiGame')
				await self.send_refresh_message()

			elif message_type == 'add_bot':	
				address = data.get('address')
				if len(lobby_data[self.lobby_id]['players']) < lobby_data[self.lobby_id]['max_users']:
					await self.addBot(address)

			elif message_type == 'start':
				if len(lobby_data[self.lobby_id]['players']) >= 2:
					await self.send_start_message()
				else:
					await self.send(text_data=json.dumps({
						'type': 'error',
						'content': 'Not enough players to start the game'
					}))

			elif message_type == 'exit':
				username = content.get('username')
				if username in lobby_data[self.lobby_id]['players']:
					index = lobby_data[self.lobby_id]['players'].index(username)
					lobby_data[self.lobby_id]['players'].remove(username)
					lobby_data[self.lobby_id]['is_bot'].pop(index)
				if lobby_data[self.lobby_id]['admin'] == username:
					if lobby_data[self.lobby_id]['players']:
						lobby_data[self.lobby_id]['admin'] = lobby_data[self.lobby_id]['players'][0]
					else:
						lobby_data[self.lobby_id]['admin'] = None
				await self.close()  # Close the WebSocket connection

	async def send_refresh_message(self):
		if self.lobby_id in lobby_data:
			connected_clients = list(lobby_data[self.lobby_id]['connected_clients'])

			await self.channel_layer.group_send(
				self.lobby_group_name,
				{
					'type': 'refresh_message',
					'message': {
						'admin': lobby_data[self.lobby_id]['admin'],
						'players': lobby_data[self.lobby_id]['players'],
						'is_bot': lobby_data[self.lobby_id]['is_bot'],
						'map': lobby_data[self.lobby_id]['map'],
						'maxPlayerCount': lobby_data[self.lobby_id]['max_users'],
						'roomName': lobby_data[self.lobby_id]['room_name'],
						'isTournament': lobby_data[self.lobby_id]['is_tournament'],
						'winning_score': lobby_data[self.lobby_id]['winning_score'],
						'connected_clients': connected_clients,
						'aiGame': lobby_data[self.lobby_id]['aiGame']
					},
				}
			)

	async def refresh_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps({
			'type': 'refresh',
			'content': message
		}))

	async def redirect_message(self):
		await self.send(text_data=json.dumps({
			'type': 'redirect',
		}))

	async def send_start_message(self):
		await self.channel_layer.group_send(
			self.lobby_group_name,
			{
				'type': 'start_message',
				'message': {
					'playerCount': len(lobby_data[self.lobby_id]['players']),
					'map': lobby_data[self.lobby_id]['map'],
					'roomID': self.lobby_id,
					'winning_score': lobby_data[self.lobby_id]['winning_score'],
					'player_names': lobby_data[self.lobby_id]['players'],
					'is_bot': lobby_data[self.lobby_id]['is_bot'],
					'difficulty': lobby_data[self.lobby_id]['difficulty'],
				}
			}
		)

	async def start_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps({
			'type': 'start',
			'content': message,
		}))

	async def addBot(self, address):
		# Choose a random name from the list of bot names
		available_names = [name for name in bot_names if name not in lobby_data[self.lobby_id]['players']]
		logger.info(f"lobby: Available bot names: {available_names}")
		if available_names:
			bot_name = random.choice(available_names)
			lobby_data[self.lobby_id]['players'].append(bot_name)
			lobby_data[self.lobby_id]['is_bot'].append(True)
			await self.send_refresh_message()
			logger.info(f"lobby: Added bot with name {bot_name}")
		else:
			await self.send(text_data=json.dumps({
				'type': 'error',
				'content': 'No available bot names'
			}))
