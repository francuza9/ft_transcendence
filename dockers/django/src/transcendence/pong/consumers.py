import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.hashers import make_password
from .models import User

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

class RegisterConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')  # Assuming you receive this from the frontend

        # Hash the password
        password_hash = make_password(password)

        # Save to database asynchronously
        await self.create_user(username, email, password_hash)

        # Send a response back
        await self.send(text_data=json.dumps({
            'message': 'User registered successfully'
        }))

    async def create_user(self, username, email, password_hash):
        # Save user asynchronously
        await User.objects.acreate(
            username=username,
            email=email,
            passwordHash=password_hash
        )