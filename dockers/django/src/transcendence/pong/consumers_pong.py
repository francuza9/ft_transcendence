from channels.generic.websocket import AsyncWebsocketConsumer
from .backend_pong.collisions import update_ball_position
import json
import logging
import asyncio
import struct

logger = logging.getLogger(__name__)

NOTHING = 0
COLLISION = 1
SCORE = 2

class PongConsumer(AsyncWebsocketConsumer):
	room_counters = {}
	game_states = {}

	async def connect(self):
		try:
			self.room_id = self.scope['url_route']['kwargs']['lobbyId']
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
			logger.info(f"pong: WebSocket connection accepted for room {self.room_id}")

			response_message = {'pov': pov}
			await self.send(text_data=json.dumps(response_message))
			await asyncio.sleep(0.1)
			logger.info("pong: creating task")
			asyncio.create_task(self.game_update_loop())
			logger.info("pong: created task")
		except Exception as e:
			logger.error(f"Error during connection setup: {e}")
			await self.close()


	async def disconnect(self, close_code):
		if self.room_group_name:
			await self.channel_layer.group_discard(
				self.room_group_name,
				self.channel_name
			)
		logger.info(f"pong: WebSocket connection closed with code: {close_code} for room {self.room_id}")

	async def receive(self, text_data=None, bytes_data=None):
		logger.info("pong: here")
		logger.info(f"pong: text_data: {text_data}")
		logger.info(f"pong: bytes_data: {bytes_data}")
		if bytes_data:
			try:
				format_str = '<Bff'
				playerID, positionX, positionY = struct.unpack(format_str, bytes_data)
				player_key = 'player_1' if playerID == 0 else 'player_2'
				if player_key in PongConsumer.game_states[self.room_id]['2_P']['players']:
					PongConsumer.game_states[self.room_id]['2_P']['players'][player_key]['x'] = positionX
					PongConsumer.game_states[self.room_id]['2_P']['players'][player_key]['y'] = positionY
			except KeyError as e:
				logger.info(f"pong: KeyError: {e}")
			except struct.error as e:
				logger.info(f"pong: StructError: {e}")
		elif text_data:
			data = json.loads(text_data)
			logger.info(f"pong: data recieved: {data}")
			message_type = data['type']
			if message_type == 'initial_data':
				room_size = data.get('room_size')
				if room_size is not None and 2 <= room_size <= 8:
					PongConsumer.game_states[self.room_id]['room_size'] = room_size
					logger.info(f"pong: Room size set to {PongConsumer.game_states[self.room_id]['room_size']}")
					self.room_size_event.set()
				else:
					await self.send(text_data=json.dumps({'error': 'Invalid room size'}))

	async def game_update_loop(self):
		while True:
			game_state = self.get_game_state()
			if game_state['room_size'] == 2:
				result = update_ball_position(game_state['2_P'])
				# Prepare minimal game state data
				player_1_y = game_state['2_P']['players']['player_1']['y']
				player_2_y = game_state['2_P']['players']['player_2']['y']
				ball_position = game_state['2_P']['ball_position']
				ball_direction = game_state['2_P']['ball_direction']
				ball_speed = game_state['2_P']['ball_speed']
				score = game_state['2_P']['score']

				if result == NOTHING:
					format_str = '<ffff'
					packed_data = struct.pack(
						format_str,
						ball_position['x'], ball_position['y'],
						player_1_y, player_2_y,
					)
				elif result == COLLISION:
					format_str = '<fffff'
					packed_data = struct.pack(
						format_str,
						ball_direction['x'], ball_direction['y'],
						ball_position['x'], ball_position['y'],
						ball_speed,
					)
				elif result == SCORE:
					format_str = '<fffffffii'
					packed_data = struct.pack(
						format_str,
						ball_direction['x'], ball_direction['y'],
						ball_position['x'], ball_position['y'],
						player_1_y, player_2_y,
						ball_speed,
						score[0], score[1]
					)

				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'pong_message',
						'message': packed_data
					}
				)
				await asyncio.sleep(1 / 30)  # 30 updates per second

	async def pong_message(self, event):
		packed_data = event['message']
		await self.send(bytes_data=packed_data)

	def get_game_state(self):
		return PongConsumer.game_states.get(self.room_id, {})

	async def send_message(self, msg):
		await self.channel_layer.group_send(
		self.room_group_name,
		{
			'type': 'pong_message',
			'message': msg
		}
)

	def initialize_game_state(self):
		return {
			'2_P': {
				'players': {
					'player_1': {'x': -5.9, 'y': 0},
					'player_2': {'x': 5.9, 'y': 0},
				},
				'ball_position': {'x': 0, 'y': 0},
				'ball_direction': {'x': 1.5, 'y': 0},
				'ball_speed': 0.05,
				'score': [0, 0],
			},
			'multi': {
			},
			'room_size': 0,
		}
