import random

NOTHING = 0
COLLISION = 1
SCORE = 2
FINISH = 3

def update_ball_position_multi(game_state):
	game_state['ball_position']['x'] += game_state['ball_direction']['x'] * game_state['ball_speed']