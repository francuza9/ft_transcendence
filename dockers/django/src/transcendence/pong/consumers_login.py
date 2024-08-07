import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

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
        await self.create_user(username, email, password)

        # Send a response back
        await self.send(text_data=json.dumps({
            'message': 'User registered successfully'
        }))

    async def create_user(self, username, email, password):
        # Save user asynchronously
        await User.objects.acreate(
            username=username,
            email=email,
            password=password
        )