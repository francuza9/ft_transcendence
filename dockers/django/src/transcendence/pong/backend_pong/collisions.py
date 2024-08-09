def update_ball_position(game_state):
    ball = game_state['ball_position']
    direction = game_state['ball_direction']
    speed = game_state['ball_speed']
    players = game_state['players']
    score = game_state['score']

    # Wall collision
    if ball['y'] >= 4.1 or ball['y'] <= -4.1:
        direction['y'] *= -1

    # Paddle collision
    player_1 = players['player_1']
    player_2 = players['player_2']

    if ball['x'] > 5.3 and player_2['y'] - 1 <= ball['y'] <= player_2['y'] + 1:
        relative_intersect = player_2['y'] - ball['y']
        bounce_angle = relative_intersect * (3.14159 / 4)  # Math.PI / 4
        direction['y'] = -1 * bounce_angle
        direction['x'] *= -1
        if speed < 0.3:
            speed += 0.02
    elif ball['x'] < -5.3 and player_1['y'] - 1 <= ball['y'] <= player_1['y'] + 1:
        relative_intersect = player_1['y'] - ball['y']
        bounce_angle = relative_intersect * (3.14159 / 4)
        direction['y'] = -1 * bounce_angle
        direction['x'] *= -1
        if speed < 0.3:
            speed += 0.02

    # Scoring
    if ball['x'] > 5.5:  # Player 1 scores
        score[0] += 1
        reset_ball(game_state)
    elif ball['x'] < -5.5:  # Player 2 scores
        score[1] += 1
        reset_ball(game_state)

    # Move the ball
    ball['x'] += direction['x'] * speed
    ball['y'] += direction['y'] * speed

    # Save the updated state
    game_state['ball_direction'] = direction
    game_state['ball_speed'] = speed

def reset_ball(game_state):
    game_state['ball_position'] = {'x': 0, 'y': 0}
    game_state['ball_direction'] = {'x': 1.5 if random.random() < 0.5 else -1.5, 'y': 0}
    game_state['ball_speed'] = 0.05
