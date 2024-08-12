import random

NOTHING = 0
COLLISION = 1
SCORE = 2

def update_ball_position(game_state):
    ball = game_state['ball_position']
    direction = game_state['ball_direction']
    speed = game_state['ball_speed']
    players = game_state['players']
    score = game_state['score']

    result = NOTHING

    # Wall collision
    if ball['y'] >= 4.1 or ball['y'] <= -4.1:
        direction['y'] *= -1
        result = COLLISION

    # Paddle collision
    player_1 = players['player_1']
    player_2 = players['player_2']

    if ball['x'] > 5.5 and player_2['y'] - 1 <= ball['y'] <= player_2['y'] + 1:
        relative_intersect = player_2['y'] - ball['y']
        bounce_angle = relative_intersect * (3.14159 / 4)  # Math.PI / 4
        direction['y'] = -1 * bounce_angle
        direction['x'] *= -1
        if speed < 0.3:
            speed += 0.01
        result = COLLISION
        ball['x'] = 5.5
    elif ball['x'] < -5.5 and player_1['y'] - 1 <= ball['y'] <= player_1['y'] + 1:
        relative_intersect = player_1['y'] - ball['y']
        bounce_angle = relative_intersect * (3.14159 / 4)
        direction['y'] = -1 * bounce_angle
        direction['x'] *= -1
        if speed < 0.3:
            speed += 0.01
        result = COLLISION
        ball['x'] = -5.5

    # Scoring
    if ball['x'] > 5.7:  # Player 1 scores
        # score[0] = int(score[0]) + 1
        score[0] += 1;
        speed = 0.05
        reset_ball(game_state)
        result = SCORE
    elif ball['x'] < -5.7:  # Player 2 scores
        # score[1] = int(score[1]) + 1
        score[1] += 1;
        speed = 0.05
        reset_ball(game_state)
        result = SCORE

    # Move the ball
    ball['x'] += direction['x'] * speed
    ball['y'] += direction['y'] * speed

    # Save the updated state
    # game_state['ball_direction'] = direction
    game_state['ball_speed'] = speed
    return result

def reset_ball(game_state):
    game_state['ball_position'] = {'x': 0, 'y': 0}
    game_state['players']['player_1']['y'] = 0
    game_state['players']['player_2']['y'] = 0

    # Randomly choose the horizontal direction
    direction_x = 1.5 if random.random() < 0.5 else -1.5
    
    # Set the direction to move horizontally
    game_state['ball_direction'] = {'x': direction_x, 'y': 0}