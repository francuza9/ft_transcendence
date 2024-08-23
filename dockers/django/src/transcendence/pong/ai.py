import time

class AI:
	def __init__(self, player_id):
		self.player_id = player_id
		self.last_decision_time = 0
		self.cached_ball = {'x': 0, 'y': 0}
		self.player_position = 0

	def update_ball(self, ball_position):
		self.cached_ball = ball_position

	def decide_direction(self, game_state):
		current_time = time.time()
		if current_time - self.last_update_time >= 1:
			self.last_update_time = current_time
			ball_position = game_state['ball_position']
			player_position = game_state['players'][f'player_{self.player_id + 1}']['y']

		if ball_position['y'] > player_position:
			if self.player_id == 0 and player_position < 3.4:
				self.player_position += 0.1
			elif self.player_id == 1 and player_position < 3.4:
				self.player_position -= 0.1
			return 'down'
		elif ball_position['y'] < player_position:
			if self.player_id == 0 and player_position > -3.4:
				self.player_position -= 0.1
			elif self.player_id == 1 and player_position > -3.4:
				self.player_position += 0.1
			return 'up'
		return 'none'

	def decide_direction_multi(self, game_state):
		ball_position = game_state['ball_position']
		player_position = game_state['players'][f'player_{self.player_id + 1}']['y']

		if ball_position['y'] > player_position:
			return 'down'  # Move down to follow the ball
		elif ball_position['y'] < player_position:
			return 'up'  # Move up to follow the ball
		return 'none'  # No movement required
