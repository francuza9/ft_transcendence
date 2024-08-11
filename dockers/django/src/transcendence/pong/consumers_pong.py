import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from .backend_pong.collisions import update_ball_position
import struct

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

	async def receive(self, bytes_data):
		format_str = '<Bff'  # Little-endian: B (unsigned byte), f (float)

		playerID, positionX, positionY = struct.unpack(format_str, bytes_data)

		player_key = 'player_1' if playerID == 0 else 'player_2'

		if player_key in PongConsumer.game_states[self.room_id]['players']:
			PongConsumer.game_states[self.room_id]['players'][player_key]['x'] = positionX
			PongConsumer.game_states[self.room_id]['players'][player_key]['y'] = positionY

	async def game_update_loop(self):
		while True:
			game_state = self.get_game_state()
			update_ball_position(game_state)

			# Prepare minimal game state data
			player_1_y = game_state['players']['player_1']['y']
			player_2_y = game_state['players']['player_2']['y']
			ball_pos = game_state['ball_position']
			ball_dir = game_state['ball_direction']

			# Pack minimal game state data into bytes
			format_str = '<ffffff'  # Little-endian: f (float) for each value
			packed_data = struct.pack(
				format_str,
				ball_pos['x'], ball_pos['y'],  # ball position
				ball_dir['x'], ball_dir['y'],  # ball direction
				player_1_y, player_2_y         # player positions
			)

			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'pong_message',
					'message': packed_data
				}
			)
			await asyncio.sleep(1 / 30)  # 24 updates per second

	async def pong_message(self, event):
		packed_data = event['message']
		await self.send(bytes_data=packed_data)


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
