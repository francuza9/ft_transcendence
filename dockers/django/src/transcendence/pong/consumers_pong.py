from channels.generic.websocket import AsyncWebsocketConsumer
from .backend_pong.collisions import update_ball_position
from .backend_pong.collisions_multi import update_ball_position_multi
import json
import logging
import asyncio
import struct
import random

logger = logging.getLogger(__name__)

NOTHING = 0
COLLISION = 1
SCORE = 2
FINISH = 3

class PongConsumer(AsyncWebsocketConsumer):
	room_counters = {}
	game_states = {}

	async def connect(self):
		try:
			self.room_id = self.scope['url_route']['kwargs']['lobbyId']
			self.room_group_name = f"pong_{self.room_id}"

			if self.room_id not in PongConsumer.room_counters:
				PongConsumer.room_counters[self.room_id] = 1
				PongConsumer.game_states[self.room_id] = await self.initialize_game_state()
			else:
				PongConsumer.room_counters[self.room_id] += 1

			pov = PongConsumer.room_counters[self.room_id]

			await self.channel_layer.group_add(
				self.room_group_name,
				self.channel_name
			)
			await self.accept()
			logger.info(f"pong: WebSocket connection accepted for room {self.room_id}")

			response_message = {'pov': pov}
			await self.send(text_data=json.dumps(response_message))
			await asyncio.sleep(3)
			asyncio.create_task(self.game_update_loop())
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
		if bytes_data:
			game_state = PongConsumer.game_states.get(self.room_id, {})
			try:
				format_str = '<Bff'
				if len(bytes_data) == struct.calcsize(format_str):
					playerID, positionX, positionY = struct.unpack(format_str, bytes_data)
					if game_state.get('room_size') == 2:
						player_key = 'player_1' if playerID == 0 else 'player_2'
						if player_key in game_state.get('2_P', {}).get('players', {}):
							game_state['2_P']['players'][player_key]['x'] = positionX
							game_state['2_P']['players'][player_key]['y'] = positionY
					else:
						playerID -= 1
						players_list = game_state.setdefault('multi', {}).setdefault('players', [])
						while len(players_list) <= playerID:
							players_list.append({})
						players_list[playerID]['x'] = positionX
						players_list[playerID]['y'] = positionY
				else:
					logger.info(f"pong: Received buffer size mismatch: {len(bytes_data)} bytes")
			except KeyError as e:
				logger.info(f"pong: KeyError: {e}")
			except struct.error as e:
				logger.info(f"pong: StructError: {e}")
		elif text_data:
			data = json.loads(text_data)
			message_type = data.get('type')
			if message_type == 'initial_data':
				room_size = data.get('room_size')
				winning_score = data.get('winning_score')
				if room_size is not None and 2 <= room_size <= 8:
					game_state = PongConsumer.game_states.setdefault(self.room_id, {})
					game_state['room_size'] = room_size
					game_state['2_P'] = game_state.get('2_P', {})
					game_state['2_P']['winning_score'] = winning_score
					logger.info(f"pong: Room size set to {room_size}")
				else:
					await self.send(text_data=json.dumps({'error': 'Invalid room size'}))
			elif message_type == 'init':
				content = data.get('content', {})
				logger.info(f"pong: multi data received: {data}")
				edges = content.get('vectors', [])
				logger.info(f"pong: Edges: {edges}")
				game_state = PongConsumer.game_states.setdefault(self.room_id, {})
				multi = game_state.setdefault('multi', {})
				multi['edges'] = edges

	async def game_update_loop(self):
		game_state = await self.get_game_state()
		game_state['multi']['ball_direction'] = {
			'x': random.choice([1.5, -1.5]),
			'y': 0
		}
		game_state['2_P']['ball_direction'] = {
			'x': random.choice([1.5, -1.5]),
			'y': 0,
		}
		while True:
			game_state = await self.get_game_state()
			
			if game_state.get('room_size') == 2:
				result = update_ball_position(game_state['2_P'])
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
				elif result == FINISH:
					format_str = '<ii'
					packed_data = struct.pack(
						format_str,
						score[0], score[1],
					)
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'pong_message',
						'message': packed_data,
						'json': False
					}
				)
				if result == FINISH:
					break
			else:
				result = update_ball_position_multi(game_state)
				json_message = json.dumps({
					'ball': {
							'ball_direction': game_state['multi']['ball_direction'],
							'ball_speed': game_state['multi']['ball_speed'],
						},
					'players': game_state['multi']['players'],
				})
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'pong_message',
						'message': json_message,
						'json': True
					}
				)

			await asyncio.sleep(1 / 30)  # 30 updates per second

	async def pong_message(self, event):
		packed_data = event['message']
		if event.get('json', False):
			await self.send(text_data=packed_data)
		else:
			await self.send(bytes_data=packed_data)

	async def get_game_state(self):
		return PongConsumer.game_states.get(self.room_id, {})

	async def send_message(self, msg):
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'pong_message',
				'message': msg
			}
		)

	async def initialize_game_state(self):
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
				'winning_score': 999,
				'finished': False,
			},
			'multi': {
				'edges': [],
				'players': [],
				'ball_position': {'x': 0, 'y': 0},
				'ball_direction': {'x': 1.5, 'y': 0},
				'ball_speed': 0.05,
				'finished': False,
			},
			'room_size': 0,
		}
