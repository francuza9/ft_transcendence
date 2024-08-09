import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from .backend_pong.collisions import update_ball_position

logger = logging.getLogger(__name__)

class PongConsumer(AsyncWebsocketConsumer):
	room_counters = {}
	game_states = {}

	async def connect(self):
		self.room_id = self.scope['url_route']['kwargs']['roomId']
		self.room_group_name = f"pong_{self.room_id}"
		if self.room_id not in PongConsumer.room_counters:
			PongConsumer.room_counters[self.room_id] = 1
			PongConsumer.game_states[self.room_id] = self.initialize_game_state()
		else:
			PongConsumer.room_counters[self.room_id] += 1
		pov = PongConsumer.room_counters[self.room_id] if PongConsumer.room_counters[self.room_id] <= 2 else 0
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)

		await self.accept()
		logger.info(f"WebSocket connection accepted for room {self.room_id}")
		response_message = {'pov': pov}
		await self.send(text_data=json.dumps(response_message))
		# Start game loop if it's the first player
		if PongConsumer.room_counters[self.room_id] == 1:
			asyncio.create_task(self.game_update_loop())

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)
		logger.info(f"WebSocket connection closed with code: {close_code} for room {self.room_id}")

	async def receive(self, text_data):
		data = json.loads(text_data)
		player = data.get('player')
		position_y = data.get('position')
	
		if player == 1:
			player_key = 'player_1'
		elif player == 2:
			player_key = 'player_2'
		else:
			return  # Invalid player number

		# Update the player's y position in the game state
		if player_key in PongConsumer.game_states[self.room_id]['players']:
			PongConsumer.game_states[self.room_id]['players'][player_key]['y'] = position_y

		# Send updated game state back to all players
		game_state = self.get_game_state()
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'pong_message',
				'message': game_state
			}
		)


	async def game_update_loop(self):
		while True:
			game_state = self.get_game_state()
			update_ball_position(game_state)
			# Broadcast updated game state
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'pong_message',
					'message': game_state
				}
			)
			await asyncio.sleep(1 / 60)  # 60 updates per second

	async def pong_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps(message))

	def get_game_state(self):
		return PongConsumer.game_states.get(self.room_id, {})

	def initialize_game_state(self):
		return {
			'players': {
				'player_1': {'x': -5.9, 'y': 0},
				'player_2': {'x': 5.9, 'y': 0},},
			'ball_position': {'x': 0, 'y': 0},
			'ball_direction': {'x': 1.5, 'y': 0},
			'ball_speed': 0.05,
			'score': [0, 0],
		}
