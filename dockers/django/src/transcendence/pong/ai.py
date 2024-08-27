import time
import logging

logger = logging.getLogger(__name__)

class AI:
	def __init__(self, player_id, game_state, difficulty):
		self.player_id = player_id
		self.last_decision_time = time.time()
		self.cached_ball = {'x': 0, 'y': 0}
		self.player_position = 0
		if game_state['room_size'] == 2:
			self.ball_position = game_state['2_P']['ball_position']
			self.player_position = game_state['2_P']['players'][f'player_{self.player_id + 1}']
			self.ball_direction = game_state['2_P']['ball_direction']
		self.difficulty_map = [
			self.decide_direction_Novice,						# 0: Novice
			self.decide_direction_Moderate,						# 1: Moderate
			self.decide_direction_Brutal,						# 2: Brutal
			lambda gs: self.decide_direction_Brutal(gs, True)	# 3: Insane
		]
		self.difficulty_index = ['Novice', 'Moderate', 'Brutal', 'Insane'].index(difficulty)

	def update_ball(self, ball_position):
		self.cached_ball = ball_position

	def ai_move(self, game_state):
		return self.difficulty_map[self.difficulty_index](game_state)

	def balls_going_otherway(self):
		if self.player_position['x'] < 0 and self.ball_direction['x'] > 0:
			if self.player_position['y'] > 0:
				return 'up'
			elif self.player_position['y'] < 0:
				return 'down'
		elif self.player_position['x'] > 0 and self.ball_direction['x'] < 0:
			if self.player_position['y'] > 0:
				return 'up'
			elif self.player_position['y'] < 0:
				return 'down'
		return None

	def decide_direction_Novice(self, game_state):
		current_time = time.time()
		if current_time - self.last_decision_time >= 1:
			self.last_decision_time = current_time
			self.ball_position = game_state['ball_position']
			self.ball_direction = game_state['ball_direction']
			self.player_position = game_state['players'][f'player_{self.player_id + 1}']

		if self.ball_position['y'] > self.player_position['y']:
			if self.player_id == 0 and self.player_position['y']:
				self.player_position['y'] += 0.2
			elif self.player_id == 1 and self.player_position['y'] < 3.4:
				self.player_position['y'] += 0.2
			return 'down'
		elif self.ball_position['y'] < self.player_position['y'] - 0.5:
			if self.player_id == 0 and self.player_position['y'] > -3.4:
				self.player_position['y'] -= 0.2
			elif self.player_id == 1 and self.player_position['y'] > -3.4:
				self.player_position['y'] -= 0.2
			return 'up'
		return 'none'

	def decide_direction_Moderate(self, game_state):
		current_time = time.time()
		if current_time - self.last_decision_time >= 1:
			self.last_decision_time = current_time
			self.ball_position = game_state['ball_position']
			self.ball_direction = game_state['ball_direction']
			self.player_position = game_state['players'][f'player_{self.player_id + 1}']

		if self.ball_position['y'] > self.player_position['y'] + 0.5:
			if self.player_id == 0 and self.player_position['y'] < 3.4:
				self.player_position['y'] += 0.2
			elif self.player_id == 1 and self.player_position['y'] < 3.4:
				self.player_position['y'] += 0.2
			return 'down'
		elif self.ball_position['y'] < self.player_position['y'] - 0.5:
			if self.player_id == 0 and self.player_position['y'] > -3.4:
				self.player_position['y'] -= 0.2
			elif self.player_id == 1 and self.player_position['y'] > -3.4:
				self.player_position['y'] -= 0.2
			return 'up'
		return 'none'

	def decide_direction_Brutal(self, game_state, Insane=False):
		current_time = time.time()
		if current_time - self.last_decision_time >= 1:
			self.last_decision_time = current_time
			self.ball_position = game_state['ball_position']
			self.ball_direction = game_state['ball_direction']
			self.player_position = game_state['players'][f'player_{self.player_id + 1}']
			# TO SEE DURING CORRECTION IF AI GETS INFO ONLY 1 TIME PER SECOND
			# docker logs -f django for realtime logs
			# logger.info(f"AI retrieved information at {current_time}")

		if Insane and self.balls_going_otherway() is not None:
			return self.balls_going_otherway()

		if self.ball_position['y'] > self.player_position['y'] + 1:
			if self.player_id == 0 and self.player_position['y'] < 3.4:
				self.player_position['y'] += 0.2
			elif self.player_id == 1 and self.player_position['y'] < 3.4:
				self.player_position['y'] += 0.2
			return 'down'
		elif self.ball_position['y'] < self.player_position['y'] - 1:
			if self.player_id == 0 and self.player_position['y'] > -3.4:
				self.player_position['y'] -= 0.2
			elif self.player_id == 1 and self.player_position['y'] > -3.4:
				self.player_position['y'] -= 0.2
			return 'up'
		return 'none'