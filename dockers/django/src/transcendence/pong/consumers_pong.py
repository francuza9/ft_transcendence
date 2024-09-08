from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .backend_pong.collisions import update_ball_position
from .backend_pong.collisions_multi import update_ball_position_multi
from .consumers_tournament import tournament_states
from .ai import AI
from .models import Game, Profile, CustomUser
import json
import logging
import asyncio
import struct
import random
import time

logger = logging.getLogger(__name__)

NOTHING = 0
COLLISION = 1
SCORE = 2
FINISH = 3

class PongConsumer(AsyncWebsocketConsumer):
	room_counters = {}
	game_states = {}
	ai_instances = {}

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
					logger.info(f"pong: Received buffer size mismatch: {len(bytes_data)} bytes")
			except KeyError as e:
				logger.info(f"pong: KeyError: {e}")
			except struct.error as e:
				logger.info(f"pong: StructError: {e}")
		elif text_data:
			data = json.loads(text_data)
			message_type = data.get('type')
			game_state = PongConsumer.game_states.setdefault(self.room_id, {})

			if message_type in ['initial_data', 'init']:
				player_names = data.get('player_names', [])
				is_bot = data.get('is_bot', [])
				player_data = {}
				for i in range(len(player_names)):
					player_data[player_names[i]] = is_bot[i]
				game_state['player_data'] = player_data
				if message_type == 'initial_data': # maybe needs to be removed (test with 1v1 after)
					game_state['loop_count'] += 1
					if (game_state['loop_count'] == 1):
						asyncio.create_task(self.game_update_loop())

			if message_type == 'initial_data':
				for player_name, bot_status in player_data.items():
					if bot_status:
						player_id = player_names.index(player_name)
						difficulty = data.get('difficulty', 'Novice')
						PongConsumer.ai_instances.setdefault(self.room_id, {})[player_id] = AI(player_id, game_state, difficulty)

				room_size = data.get('room_size')
				winning_score = data.get('winning_score')
				if room_size is not None and 2 <= room_size <= 8:
					game_state['room_size'] = room_size
					game_state['2_P'] = game_state.get('2_P', {})
					game_state['2_P']['winning_score'] = winning_score
					game_state['partOfTournament'] = data.get('partOfTournament', False)
					game_state['tournamentID'] = data.get('tournamentID', None)
				else:
					await self.send(text_data=json.dumps({'error': 'Invalid room size'}))
			elif message_type == 'init':
				content = data.get('content', {})
				edges = content.get('vectors', [])
				multi = game_state.setdefault('multi', {})
				multi['edges'] = edges
			
			elif message_type == 'player_info':
				content = data.get('content', {})
				playerID = content.get('ID') - 1
				players_list = game_state.setdefault('multi', {}).setdefault('players', [])
				while len(players_list) <= playerID:
					players_list.append({})
				players_list[playerID]['x'] = content.get('x')
				players_list[playerID]['y'] = content.get('y')
				players_list[playerID]['name'] = content.get('name')

	async def game_update_loop(self):
		await asyncio.sleep(3)
		game_length = time.time()
		game_state = await self.get_game_state()
		alreadySent = False
		ra = random.uniform(-1, 1)
		game_state['multi']['ball_direction'] = {
			'x': ra,
			'y': (1 - ra**2) ** 0.5,
		}
		game_state['2_P']['ball_direction'] = {
			'x': random.choice([1.5, -1.5]),
			'y': 0,
		}
		logger.info("Game Loop Started")
		while True:
			game_state = await self.get_game_state()
			if game_state.get('room_size') == 2:
				for player_id, ai_instance in PongConsumer.ai_instances.get(self.room_id, {}).items():
					direction = ai_instance.ai_move(game_state['2_P'])
					if direction == 'down':
						if player_id == 0 and game_state['2_P']['players']['player_1']['y'] < 3.4:
							game_state['2_P']['players']['player_1']['y'] += 0.2
						elif player_id == 1 and game_state['2_P']['players']['player_2']['y'] < 3.4:
							game_state['2_P']['players']['player_2']['y'] += 0.2
					elif direction == 'up':
						if player_id == 0 and game_state['2_P']['players']['player_1']['y'] > -3.4:
							game_state['2_P']['players']['player_1']['y'] -= 0.2
						elif player_id == 1 and game_state['2_P']['players']['player_2']['y'] > -3.4:
							game_state['2_P']['players']['player_2']['y'] -= 0.2
				
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
					time_length = time.time() - game_length
					times = list()
					times.append(time_length)
					times.append(time_length)
					names_list = list(game_state.get('player_data', {}).keys())
					if not names_list:
						names_list = game_state.get('multi_winners')
						names_list = [names_list[0].get('name', 'player_1'), names_list[1].get('name', 'player_2')]
					winner_username = names_list[0] if score[0] > score[1] else names_list[1]
					if game_state.get('partOfTournament', False):
						id = game_state.get('tournamentID', None)
						if id in tournament_states:
							tournament = tournament_states[id]
							winner_data = {winner_username: game_state['player_data'][winner_username]}
							if winner_data not in tournament['results']:
								tournament['results'].append(winner_data)
								# maybe notify clients that someone won
					packed_data = {
						'scores': score,
						'time': times,
						'players': names_list,
					}
					try:
						await self.channel_layer.group_send(
							self.room_group_name,
							{
								'type': 'finish',
								'message': packed_data,
							}
						)
						await self.send(text_data=json.dumps(packed_data))
					except:
						logger.info("Tried to send data to a closed connection")
					
					# updating database
					botGame = False
					if True in game_state.get('player_data', {}).values():
						botGame = True
					p1 = await self.getUserDB(names_list[0])
					p2 = await self.getUserDB(names_list[1])
					pwin = await self.getUserDB(winner_username)

					new_game = await sync_to_async(Game.objects.create)(
						player1=p1,
						player2=p2,
						winner=pwin,
						has_bots=botGame,
						player1Score=score[0],
						player2Score=score[1],
						is_tournament=game_state.get('partOfTournament', False),
					)
					await sync_to_async(new_game.save)()

					p1 = await self.getProfileDB(names_list[0])
					p2 = await self.getProfileDB(names_list[1])
					pwin = await self.getProfileDB(winner_username)

					if not botGame:
						if p1:
							if pwin and pwin == p1:
								p1.gamesWon += 1
							else:
								p1.gamesLost += 1
							p1.gamesPlayed += 1
							await sync_to_async(p1.save)()
						if p2:
							if pwin and pwin == p2:
								p2.gamesWon += 1
							else:
								p2.gamesLost += 1
							p2.gamesPlayed += 1
							await sync_to_async(p2.save)()
					break
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'pong_message',
						'message': packed_data,
						'json': False
					}
				)
				if result == FINISH:
					game_state['loop_count'] -= 1
					break
			else:
				if len(game_state['multi']['players']) == len(game_state['multi']['edges']) \
				and game_state['room_size'] <= len(game_state['multi']['players']):
					game_state['multi']['players'].pop(len(game_state['multi']['players']) - 1)
				if len(game_state['multi']['players']) != len(game_state['multi']['edges']) - 1 :
					await asyncio.sleep(1 / 30)
					continue
				result_multi = update_ball_position_multi(game_state)
				if result_multi != None:
					game_state['room_size'] -= 1
					winners = None
					if game_state['room_size'] == 2:
						winners = game_state['multi']['players'].copy()
						winners.pop(result_multi)
						game_state['multi_winners'] = winners
					
					game_state['multi']['players'] = []
					game_state['multi']['finished'] = True
					game_state['loop_count'] -= 1
					await asyncio.sleep(1)
					json_message = json.dumps({
					'ball': {
							'ball_position': game_state['multi']['ball_position'],
							'ball_direction': game_state['multi']['ball_direction'],
							'ball_speed': game_state['multi']['ball_speed'],
						},
						'players': game_state['multi']['players'],
						'result': result_multi,
						'pcount': game_state['room_size'],
						'winners': winners,
					})
					if not alreadySent:
						await self.channel_layer.group_send(
							self.room_group_name,
							{
								'type': 'pong_message',
								'message': json_message,
								'json': True
							}
						)
					if winners != None:
						alreadySent = True
					await asyncio.sleep(2)
				else:
					json_message = json.dumps({
						'ball': {
								'ball_position': game_state['multi']['ball_position'],
								'ball_direction': game_state['multi']['ball_direction'],
								'ball_speed': game_state['multi']['ball_speed'],
							},
						'players': game_state['multi']['players'],
						'result': result_multi,
						'pcount': game_state['room_size'],
					})
					game_state['multi']['finished'] = False
					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'pong_message',
							'message': json_message,
							'json': True
						}
					)
					result_multi = None

			await asyncio.sleep(1 / 30)  # 30 updates per second

	async def finish(self, event):
		packed_data = event['message']
		try:
			await self.send(text_data=json.dumps(packed_data))
		except:
			logger.info("Tried to send data to a closed connection")



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
				'ball_speed': 0.08,
				'score': [0, 0],
				'winning_score': 999,
				'finished': False,
			},
			'multi': {
				'edges': [],
				'players': [],
				'ball_position': {'x': 0, 'y': 0},
				'ball_direction': {'x': 1.5, 'y': 0},
				'ball_speed': 0.08,
				'finished': False,
			},
			'room_size': 2,
			'player_data': {},  # Changed to dictionary format
			'partOfTournament': False,
			'tournamentID': None,
			'loop_count': 0,
			'multi_winners': [],
		}

	async def getProfileDB(self, target):
		try:
			user = await sync_to_async(CustomUser.objects.get)(username=target)
			
			profile = await sync_to_async(Profile.objects.get)(user=user)
		except CustomUser.DoesNotExist:
			logger.info("User not found")
			profile = None
		except Profile.DoesNotExist:
			logger.info("Profile not found for user")
			profile = None
		except Exception as e:
			logger.error(f"Error fetching profile: {e}")
			profile = None
			
		return profile

	async def getUserDB(self, target):
		try:
			user = await sync_to_async(CustomUser.objects.get)(username=target)
		except CustomUser.DoesNotExist:
			logger.info("User not found")
			user = None
		except Exception as e:
			logger.error(f"Error fetching profile: {e}")
			user = None
			
		return user

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
