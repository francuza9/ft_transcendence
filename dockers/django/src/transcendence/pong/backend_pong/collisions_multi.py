import random
import logging

logger = logging.getLogger(__name__)

def update_ball_position_multi(game_state):
	ball = game_state['multi']['ball_position']
	direction = game_state['multi']['ball_direction']
	speed = game_state['multi']['ball_speed']
	players = game_state['multi']['players']
	corners = game_state['multi']['edges']

	# Move the ball
	ball['x'] += direction['x'] * speed
	ball['y'] += direction['y'] * speed

	# Check for collisions with players' paddles
	for player in players:
		if check_collision_with_player(ball, player):
			direction = reflect_direction_off_paddle(ball, direction, player)
			game_state['multi']['ball_direction'] = direction
			if game_state['multi']['ball_speed'] < 0.3:
				game_state['multi']['ball_speed'] += 0.01
			return None

	# Check if the ball is inside the polygon
	if not is_ball_inside_polygon(ball, corners):
		eliminated_player_index = determine_eliminated_player(ball, players)
		if eliminated_player_index is not None:
			return eliminated_player_index

	# Update the game state
	game_state['multi']['ball_direction'] = direction

	return None

def check_collision_with_player(ball, player, paddle_length=2, ball_radius=0.25):
	"""Check if the ball collides with the player's paddle."""
	player_x, player_y = player['x'], player['y']

	if player_x == 0:  # Vertical paddle (e.g., top/bottom player)
		return (player_y - paddle_length / 2 <= ball['y'] <= player_y + paddle_length / 2 and
				player_x - ball_radius <= ball['x'] <= player_x + ball_radius)
	else:  # Horizontal paddle (e.g., left/right player)
		return (player_x - paddle_length / 2 <= ball['x'] <= player_x + paddle_length / 2 and
				player_y - ball_radius <= ball['y'] <= player_y + ball_radius)

def reflect_direction_off_paddle(ball, direction, player):
	"""Reflect the ball's direction based on where it hit the paddle."""
	player_x, player_y = player['x'], player['y']

	# Calculate the relative position where the ball hit the paddle
	if player_x == 0:  # Vertical paddle (e.g., top/bottom player)
		offset = (ball['y'] - player_y) / 2  # Normalize to range [-0.5, 0.5]
		direction['y'] = offset  # Reflect with an angle based on offset
		direction['x'] = -direction['x']  # Reverse the horizontal direction
	else:  # Horizontal paddle (e.g., left/right player)
		offset = (ball['x'] - player_x) / 2  # Normalize to range [-0.5, 0.5]
		direction['x'] = offset  # Reflect with an angle based on offset
		direction['y'] = -direction['y']  # Reverse the vertical direction

	# Normalize the direction vector to maintain consistent speed
	speed = (direction['x']**2 + direction['y']**2)**0.5
	direction['x'] /= speed
	direction['y'] /= speed

	return direction

def is_ball_inside_polygon(ball, corners):
	n = len(corners)
	inside = False

	p1x, p1y = corners[0]['x'], corners[0]['y']
	for i in range(n + 1):
		p2x, p2y = corners[i % n]['x'], corners[i % n]['y']
		if ball['y'] > min(p1y, p2y):
			if ball['y'] <= max(p1y, p2y):
				if ball['x'] <= max(p1x, p2x):
					if p1y != p2y:
						xinters = (ball['y'] - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
					if p1x == p2x or ball['x'] <= xinters:
						inside = not inside
		p1x, p1y = p2x, p2y

	return inside

def determine_eliminated_player(ball, players, paddle_length=2, ball_radius=0.25):
	"""Determine if a player missed the ball and should be eliminated."""
	for index, player in enumerate(players):
		player_x, player_y = player['x'], player['y']

		# Check if the ball passed through the player's paddle area and is outside
		if player_x == 0:  # Vertical paddle (top/bottom)
			if not (player_y - paddle_length / 2 <= ball['y'] <= player_y + paddle_length / 2):
				return index
		else:  # Horizontal paddle (left/right)
			if not (player_x - paddle_length / 2 <= ball['x'] <= player_x + paddle_length / 2):
				return index

	return None