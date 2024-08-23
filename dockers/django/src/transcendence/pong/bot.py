import asyncio
import websockets
import json
import logging

logger = logging.getLogger(__name__)

async def pong_bot(address, roomID, player_pos, ball_data):
    uri = f"wss://{address}/ws/{roomID}"  # Use ws:// if not using HTTPS

    try:
        logger.info(f"Attempting to connect to WebSocket server at {uri}")
        async with websockets.connect(uri) as websocket:
            logger.info(f"Connected to WebSocket server at {uri}")

            # Send initial bot connection message
            await websocket.send(json.dumps({"type": "bot_joined", "content": {"pov": 1}}))

            positionX = 0.0  # Initialize positionX
            positionY = 0.0  # Initialize positionY

            while True:
                try:
                    # Listen for messages from the server
                    message = await websocket.recv()

                    # Handle binary data or JSON messages based on your game logic
                    if isinstance(message, bytes):
                        playerID, positionX, positionY = struct.unpack('<Bff', message)
                        logger.info(f"Bot received position: {positionX}, {positionY}")
                    else:
                        data = json.loads(message)
                        logger.info(f"Bot received JSON message: {data}")

                    # Update bot's position or send other messages
                    positionX += 0.1  # Example update
                    await websocket.send(struct.pack('<Bff', 1, positionX, positionY))

                except websockets.ConnectionClosed:
                    logger.info("Bot Connection closed")
                    break
                except Exception as e:
                    logger.error(f"Bot encountered an error during communication: {e}")
                    break

    except Exception as e:
        logger.error(f"Failed to connect to WebSocket server: {e}")
