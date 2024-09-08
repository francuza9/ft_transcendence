from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import CustomUser, Profile
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
			self.username = ""

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
					'aiGame': False,
					'partOfTournament': False,
					'tournamentID': None,
					'available': True,
					'started': False,
					'display_names': [],
				}

			lobby_data[self.lobby_id]['connected_clients'].add(self.channel_name)
			if len(lobby_data[self.lobby_id]['players']) < lobby_data[self.lobby_id]['max_users'] - 1:
				lobby_data[self.lobby_id]['available'] = True
			else:
				lobby_data[self.lobby_id]['available'] = False


			await self.channel_layer.group_add(
				self.lobby_group_name,
				self.channel_name
			)
			await self.accept()
			logger.info(f"lobby: WebSocket connection accepted for lobby {self.lobby_id}")

		except Exception as e:
			logger.error(f"Error during connection setup: {e}")
			await self.close()

	async def disconnect(self, close_code):
		logger.info(f"lobby: Disconnect called with code: {close_code}")

		if self.lobby_id in lobby_data:
			# Remove the channel from connected clients
			lobby_data[self.lobby_id]['connected_clients'].discard(self.channel_name)

			try:
				index = lobby_data[self.lobby_id]['players'].index(self.username)
				if index != -1:
					lobby_data[self.lobby_id]['players'].pop(index)
					lobby_data[self.lobby_id]['is_bot'].pop(index)
					if lobby_data[self.lobby_id]['admin'] == self.username:
						if lobby_data[self.lobby_id]['players']:
							lobby_data[self.lobby_id]['admin'] = lobby_data[self.lobby_id]['players'][0]
						else:
							lobby_data[self.lobby_id]['admin'] = None
			except:
				pass

			# Remove the player if they exist
			if self.channel_name in lobby_data[self.lobby_id]['players']:
				index = lobby_data[self.lobby_id]['players'].index(self.channel_name)
				lobby_data[self.lobby_id]['players'].pop(index)
				lobby_data[self.lobby_id]['is_bot'].pop(index)
				if lobby_data[self.lobby_id]['admin'] == self.channel_name:
					if lobby_data[self.lobby_id]['players']:
						lobby_data[self.lobby_id]['admin'] = lobby_data[self.lobby_id]['players'][0]
					else:
						lobby_data[self.lobby_id]['admin'] = None

			if len(lobby_data[self.lobby_id]['players']) < lobby_data[self.lobby_id]['max_users']:
				lobby_data[self.lobby_id]['available'] = True

			# Remove lobby if no connected clients
			if not lobby_data[self.lobby_id]['connected_clients']:
				await asyncio.sleep(10)  # Wait for a while to ensure it's not a temporary issue
				if not lobby_data[self.lobby_id]['connected_clients']:
					del lobby_data[self.lobby_id]
					logger.info(f"lobby: Lobby {self.lobby_id} removed due to inactivity.")

		await self.channel_layer.group_discard(
			self.lobby_group_name,
			self.channel_name
		)

		if self.lobby_id in lobby_data:
			try:
				await self.send_refresh_message()
			except Exception as e:
				logger.error(f"lobby: Error sending refresh message: {e}")

		logger.info(f"lobby: WebSocket connection closed with code: {close_code} for lobby {self.lobby_id}")


	async def receive(self, text_data=None):
		if text_data:
			data = json.loads(text_data)
			message_type = data.get('type')
			content = data.get('content')

			if message_type == 'init':
				username = content.get('username')
				self.username = username
				if lobby_data[self.lobby_id]['admin'] is None:
					lobby_data[self.lobby_id]['admin'] = username
				logger.info(f"my user: {username}, players: {lobby_data[self.lobby_id]['players']}")
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
					lobby_data[self.lobby_id]['partOfTournament'] = content.get('partOfTournament')
					lobby_data[self.lobby_id]['tournamentSocket'] = content.get('tournamentSocket')
				lobby_data[self.lobby_id]['tournamentID'] = content.get('tournamentID')
				try:
					await self.send_refresh_message()
				except:
					pass

			elif message_type == 'add_bot':	
				address = data.get('address')
				botName = data.get('botName')
				if len(lobby_data[self.lobby_id]['players']) < lobby_data[self.lobby_id]['max_users']:
					await self.addBot(address, botName)

			elif message_type == 'start':
				logger.info(f"here lobby: players: {lobby_data[self.lobby_id]['players']}")
				if len(lobby_data[self.lobby_id]['players']) < 2:
					await asyncio.sleep(0.5)
				logger.info(f"here lobby: players: {lobby_data[self.lobby_id]['players']}")
				if len(lobby_data[self.lobby_id]['players']) >= 2:
					await self.send_start_message()
				else:
					await self.send(text_data=json.dumps({
						'type': 'error',
						'content': 'Not enough players to start the game'
					}))

			elif message_type == 'start_tournament':
				if len(lobby_data[self.lobby_id]['players']) == lobby_data[self.lobby_id]['max_users']:
					await self.send_tournament_message() 

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
				await self.close()

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
						'aiGame': lobby_data[self.lobby_id]['aiGame'],
						'partOfTournament': lobby_data[self.lobby_id]['partOfTournament'],
						'tournamentSocket': lobby_data[self.lobby_id]['tournamentSocket'],
					},
				}
			)

	async def addBot(self, address, botName):
		available_names = [name for name in bot_names if name not in lobby_data[self.lobby_id]['players']]
		logger.info(f"lobby: Available bot names: {available_names}")
		if available_names:
			bot_name = random.choice(available_names)
			if botName != None:
				bot_name = botName
			lobby_data[self.lobby_id]['players'].append(bot_name)
			lobby_data[self.lobby_id]['is_bot'].append(True)
			try:
				await self.send_refresh_message()
			except:
				pass
			logger.info(f"lobby: Added bot with name {bot_name}")
		else:
			await self.send(text_data=json.dumps({
				'type': 'error',
				'content': 'No available bot names'
			}))
		if len(lobby_data[self.lobby_id]['players']) < lobby_data[self.lobby_id]['max_users']:
			lobby_data[self.lobby_id]['available'] = True
		else:
			lobby_data[self.lobby_id]['available'] = False

	async def send_tournament_message(self):
		lobby_data[self.lobby_id]['available'] = False
		lobby_data[self.lobby_id]['started'] = False
		username_is_bot_map = dict(zip(lobby_data[self.lobby_id]['players'], lobby_data[self.lobby_id]['is_bot']))
		await self.channel_layer.group_send(
			self.lobby_group_name,
			{
				'type': 'tournament_message',
				'message': username_is_bot_map,
			}
		)

	async def tournament_message(self, event):
		lobby_data[self.lobby_id]['available'] = False
		lobby_data[self.lobby_id]['started'] = False
		message = event['message']
		await self.send(text_data=json.dumps({
			'type': 'start_tournament',
			'content': message,
		}))

	async def refresh_message(self, event):
		message = event['message']
		try:
			await self.send(text_data=json.dumps({
				'type': 'refresh',
				'content': message
			}))
		except:
			logger.info("lobby: Error sending refresh message")

	async def redirect_message(self):
		await self.send(text_data=json.dumps({
			'type': 'redirect',
		}))

	async def send_start_message(self):
		lobby_data[self.lobby_id]['available'] = False
		lobby_data[self.lobby_id]['started'] = True
		display_names = []
		for name in lobby_data[self.lobby_id]['players']:
			disp = await self.getDispFromDB(name)
			display_names.append(disp)

		for i in range(len(display_names)):
			if display_names[i] == "":
				display_names[i] = lobby_data[self.lobby_id]['players'][i]

		lobby_data[self.lobby_id]['display_names'] = display_names

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
					'display_names': display_names,
					'is_bot': lobby_data[self.lobby_id]['is_bot'],
					'difficulty': lobby_data[self.lobby_id]['difficulty'],
					'partOfTournament': lobby_data[self.lobby_id]['partOfTournament'],
					'tournamentSocket': lobby_data[self.lobby_id]['tournamentSocket'],
					'tournamentID': lobby_data[self.lobby_id]['tournamentID'],
				}
			}
		)

	async def start_message(self, event):
		lobby_data[self.lobby_id]['available'] = False
		lobby_data[self.lobby_id]['started'] = True

		message = event['message']
		await self.send(text_data=json.dumps({
			'type': 'start',
			'content': message,
		}))

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
