import time
import logging

logger = logging.getLogger(__name__)

class AI:
	def __init__(self, player_id, game_state):
		self.player_id = player_id
		self.last_decision_time = time.time()
		self.cached_ball = {'x': 0, 'y': 0}
		self.player_position = 0
		if (game_state['room_size'] == 2):
			self.ball_position = game_state['2_P']['ball_position']
			self.player_position = game_state['2_P']['players'][f'player_{self.player_id + 1}']
			self.ball_direction = game_state['2_P']['ball_direction']

	def update_ball(self, ball_position):
		self.cached_ball = ball_position

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

	def decide_direction(self, game_state):
		current_time = time.time()
		if current_time - self.last_decision_time >= 1:
			self.last_decision_time = current_time
			self.ball_position = game_state['ball_position']
			self.ball_direction = game_state['ball_direction']
			self.player_position = game_state['players'][f'player_{self.player_id + 1}']
			# y > 0 moving down and y < 0 moving up
			# TO SEE DURING CORRECTION IF AI GETS INFO ONLY 1 TIME PER SECOND
			# docker logs -f django for realtime logs
			# logger.info(f"AI retrieved information at {current_time}")
		
		if self.balls_going_otherway() is not None:
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

	def decide_direction_multi(self, game_state):
		ball_position = game_state['ball_position']
		player_position['y'] = game_state['players'][f'player_{self.player_id + 1}']['y']
		if ball_position['y'] > player_position['y']:
			return 'down'  # Move down to follow the ball
		elif ball_position['y'] < player_position['y']:
			return 'up'  # Move up to follow the ball
		return 'none'  # No movement required
