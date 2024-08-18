from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import asyncio

logger = logging.getLogger(__name__)

lobby_data = {}

class LobbyConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		try:
			self.lobby_id = self.scope['url_route']['kwargs']['lobbyId']
			self.lobby_group_name = f"lobby_{self.lobby_id}"

			if self.lobby_id not in lobby_data:
				logger.info(f"lobby_data: {lobby_data}")
				lobby_data[self.lobby_id] = {
					'admin': None,
					'map': "default_map",
					'max_users': 10,
					'players': [],
					'is_tournament': False,
					'room_name': "default_room_name",
					'connected_clients': set(),
				}
			logger.info(lobby_data)

			# Add the new client to the lobby's connected clients
			lobby_data[self.lobby_id]['connected_clients'].add(self.channel_name)

			await self.channel_layer.group_add(
				self.lobby_group_name,
				self.channel_name
			)
			await self.accept()
			await self.send_refresh_message()
			logger.info(f"WebSocket connection accepted for lobby {self.lobby_id}")

		except Exception as e:
			logger.error(f"Error during connection setup: {e}")
			await self.close()

	async def disconnect(self, close_code):
		logger.info(f"Disconnect called with code: {close_code}")

		if self.lobby_id in lobby_data:
			lobby_data[self.lobby_id]['connected_clients'].discard(self.channel_name)

			if not lobby_data[self.lobby_id]['connected_clients']:
				await asyncio.sleep(10)
				if not lobby_data[self.lobby_id]['connected_clients']:
					del lobby_data[self.lobby_id]
					logger.info(f"Lobby {self.lobby_id} removed due to inactivity.")

		await self.channel_layer.group_discard(
			self.lobby_group_name,
			self.channel_name
		)
		await self.send_refresh_message()
		logger.info(f"WebSocket connection closed with code: {close_code} for lobby {self.lobby_id}")

	async def receive(self, text_data=None):
		if text_data:
			data = json.loads(text_data)
			message_type = data.get('type')
			content = data.get('content')

			if message_type == 'init':
				if lobby_data[self.lobby_id]['admin'] is None:
					lobby_data[self.lobby_id]['admin'] = content.get('username')
				if content.get('username') not in lobby_data[self.lobby_id]['players'] and len(lobby_data[self.lobby_id]['players']) < lobby_data[self.lobby_id]['max_users']:
					lobby_data[self.lobby_id]['players'].append(content.get('username'))
				else:
					self.redirect_message()

				if lobby_data[self.lobby_id]['admin'] == content.get('username') and lobby_data[self.lobby_id]['max_users'] == 10:
					lobby_data[self.lobby_id]['map'] = content.get('map')
					lobby_data[self.lobby_id]['max_users'] = content.get('maxPlayerCount')
					lobby_data[self.lobby_id]['room_name'] = content.get('roomName')
					lobby_data[self.lobby_id]['is_tournament'] = content.get('isTournament')
				await self.send_refresh_message()

			elif message_type == 'start':
				await self.send_start_message()

			elif message_type == 'exit':
				username = content.get('username')
				if username in lobby_data[self.lobby_id]['players']:
					lobby_data[self.lobby_id]['players'].remove(username)
				if lobby_data[self.lobby_id]['admin'] == username:
					if lobby_data[self.lobby_id]['players']:
						lobby_data[self.lobby_id]['admin'] = lobby_data[self.lobby_id]['players'][0]
					else:
						lobby_data[self.lobby_id]['admin'] = None
				await self.close()  # Close the WebSocket connection

	async def send_refresh_message(self):
		# Convert set to list for JSON serialization
		connected_clients = list(lobby_data[self.lobby_id]['connected_clients'])

		await self.channel_layer.group_send(
			self.lobby_group_name,
			{
				'type': 'refresh_message',
				'message': {
					'admin': lobby_data[self.lobby_id]['admin'],
					'players': lobby_data[self.lobby_id]['players'],
					'map': lobby_data[self.lobby_id]['map'],
					'maxPlayerCount': lobby_data[self.lobby_id]['max_users'],
					'roomName': lobby_data[self.lobby_id]['room_name'],
					'isTournament': lobby_data[self.lobby_id]['is_tournament'],
					'connected_clients': connected_clients
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
				'message': 'start'
			}
		)

	async def start_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps({'type': message}))
