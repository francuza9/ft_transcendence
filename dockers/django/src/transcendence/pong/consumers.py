import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        logger.info("WebSocket connection accepted")

    async def disconnect(self, close_code):
        logger.info(f"WebSocket connection closed with code: {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            logger.info(f"Received data: {data}")

            if data.get('action') == 'R' or data.get('action') == 'r':
                response_message = {'message': 'I received it'}
                await self.send(text_data=json.dumps(response_message))
                logger.info(f"Sent response: {response_message}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            await self.close()
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            await self.close()
