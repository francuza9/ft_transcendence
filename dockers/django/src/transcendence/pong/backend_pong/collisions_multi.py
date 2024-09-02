import math
import logging

logger = logging.getLogger(__name__)

def update_ball_position_multi(game_state):
	ball = game_state['multi']['ball_position']
	direction = game_state['multi']['ball_direction']
	speed = game_state['multi']['ball_speed'] * 0.2 # just for testing, TODO: remove later
	players = game_state['multi']['players']
	corners = game_state['multi']['edges']

	# Move the ball
	ball['x'] += direction['x'] * speed
	ball['y'] += direction['y'] * speed

	# Check for collisions with players' paddles
	for i in range(len(players)):
		player = players[i]
		edge = [corners[i], corners[i + 1]]
		collision_with_wall, collision_with_player = check_collision(ball, player, edge)
		if collision_with_player:
			# reflect the ball
			game_state['multi']['ball_direction'] = reflect_ball(ball, player, direction, edge)
			return None
		elif collision_with_wall or not is_inside(ball, edge):
			# player loses
			ball['x'] = 0
			ball['y'] = 0
			game_state['multi']['ball_position'] = ball
			return i


	# Update the game state
	game_state['multi']['ball_position'] = ball # TODO: remove later
	game_state['multi']['ball_direction'] = direction

	return None

def check_collision(ball, player, edge, paddle_length=2, ball_radius=0.25):
	"""Check if the ball collides with the player's paddle."""
	player_x, player_y = player['x'], player['y']
	ball_x, ball_y = ball['x'], ball['y']
	corner_1_x, corner_1_y = edge[0]['x'], edge[0]['y']
	corner_2_x, corner_2_y = edge[1]['x'], edge[1]['y']

	A = corner_2_y - corner_1_y
	B = corner_1_x - corner_2_x
	C = corner_2_x * corner_1_y - corner_1_x * corner_2_y

	# Calculate the distance from the ball to the line
	distance = abs(A * ball_x + B * ball_y + C) / (A**2 + B**2)**0.5

	# If the distance is greater than the ball's radius, there's no collision
	if distance > ball_radius:
		return False, False

	# Calculate the closest point on the line to the ball
	closest_x = ball_x - A * (A * ball_x + B * ball_y + C) / (A**2 + B**2)
	closest_y = ball_y - B * (A * ball_x + B * ball_y + C) / (A**2 + B**2)

	# Define the paddle endpoints based on its center and length
	d_x = (corner_2_x - corner_1_x) / ((corner_2_x - corner_1_x)**2 + (corner_2_y - corner_1_y)**2)**0.5
	d_y = (corner_2_y - corner_1_y) / ((corner_2_x - corner_1_x)**2 + (corner_2_y - corner_1_y)**2)**0.5

	paddle_x1 = player_x - (paddle_length / 2) * d_x
	paddle_y1 = player_y - (paddle_length / 2) * d_y
	paddle_x2 = player_x + (paddle_length / 2) * d_x
	paddle_y2 = player_y + (paddle_length / 2) * d_y

	# Check if the closest point is within the bounds of the paddle
	collision_with_player = (min(paddle_x1, paddle_x2) <= closest_x <= max(paddle_x1, paddle_x2) and
			min(paddle_y1, paddle_y2) <= closest_y <= max(paddle_y1, paddle_y2))
	
	logger.info(f"Collision with player: {collision_with_player}")
	return True, collision_with_player

def reflect_ball(ball, player, direction, edge, paddle_length=2, max_angle=math.pi/3):
	"""Reflect the ball's direction off the player's paddle."""
	player_x, player_y = player['x'], player['y']
	ball_x, ball_y = ball['x'], ball['y']
	corner_1_x, corner_1_y = edge[0]['x'], edge[0]['y']
	corner_2_x, corner_2_y = edge[1]['x'], edge[1]['y']
	direction_x, direction_y = direction['x'], direction['y']

	# Calculate the paddle's normal vector (perpendicular to the paddle's direction)
	paddle_dir_x = corner_2_x - corner_1_x
	paddle_dir_y = corner_2_y - corner_1_y
	normal_x = paddle_dir_y
	normal_y = -paddle_dir_x

	# Determine the side of the paddle the ball is on
	cross = cross_product(player_x, player_y, direction_x, direction_y, ball_x, ball_y)
	side = 1 if cross > 0 else -1
	logger.info(f"Side: {side}")

	# Calculate the distance from the paddle's center to the ball
	d = math.sqrt((ball_x - player_x)**2 + (ball_y - player_y)**2)

	# Normalize the distance relative to the paddle length
	normalized_distance = 2 * d / paddle_length

	# Calculate the reflection angle based on the distance
	reflection_angle = max_angle * normalized_distance * side
	logger.info(f"Reflection angle: {reflection_angle / math.pi * 180}")

	# Calculate the angle of the normal vector
	normal_angle = math.atan2(normal_y, normal_x)
	logger.info(f"Paddle normal angle: {normal_angle / math.pi * 180}")
	
	# Calculate the new angle of the ball
	new_angle = normal_angle + reflection_angle
	logger.info(f"New angle: {new_angle / math.pi * 180}")

	direction_x = math.cos(new_angle)
	direction_y = math.sin(new_angle)

	return {'x': direction_x, 'y': direction_y}

def cross_product(x1, y1, x2, y2, x3, y3):
	"""Calculate the cross product of vectors (x2-x1, y2-y1) and (x3-x1, y3-y1)."""
	return (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1)

def is_inside(ball, edge):
	"""Check if the point (ball_x, ball_y) is on the same side of the line defined by vertex1 and vertex2 relative to the origin."""
	ball_x, ball_y = ball['x'], ball['y']
	corner_1_x, corner_1_y = edge[0]['x'], edge[0]['y']
	corner_2_x, corner_2_y = edge[1]['x'], edge[1]['y']

	# Cross product with the origin (0, 0)
	cross_origin = cross_product(corner_1_x, corner_1_y, corner_2_x, corner_2_y, 0, 0)

	# Cross product with the ball position (ball_x, ball_y)
	cross_ball = cross_product(corner_1_x, corner_1_y, corner_2_x, corner_2_y, ball_x, ball_y)

	# Compare signs to determine if on the same side
	return cross_origin * cross_ball >= 0