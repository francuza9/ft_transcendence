import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import User

logger = logging.getLogger(__name__)

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Capture roomId from the URL route
        self.room_id = self.scope['url_route']['kwargs']['roomId']
        self.room_group_name = f"pong_{self.room_id}"

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"WebSocket connection accepted for room {self.room_id}")

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket connection closed with code: {close_code} for room {self.room_id}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            logger.info(f"Received data: {data} in room {self.room_id}")

            if data.get('action') in ['R', 'r']:
                response_message = {'message': f'Action received in room {self.room_id}'}
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'pong_message',
                        'message': response_message
                    }
                )
                logger.info(f"Sent response: {response_message}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            await self.close()
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            await self.close()

    # Handler for messages sent to the group
    async def pong_message(self, event):
        message = event['message']
        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

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