import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class LobbyConsumer(AsyncWebsocketConsumer):
    lobby_counters = {}
    connected_clients = {}  # Dictionary to track connected clients by lobby

    async def connect(self):
        try:
            self.lobby_id = self.scope['url_route']['kwargs']['lobbyId']
            self.lobby_group_name = f"lobby_{self.lobby_id}"

            if self.lobby_id not in LobbyConsumer.lobby_counters:
                LobbyConsumer.lobby_counters[self.lobby_id] = 1
                LobbyConsumer.connected_clients[self.lobby_id] = set()
            else:
                LobbyConsumer.lobby_counters[self.lobby_id] += 1

            # Add the new client to the lobby's connected clients
            LobbyConsumer.connected_clients[self.lobby_id].add(self.channel_name)

            await self.channel_layer.group_add(
                self.lobby_group_name,
                self.channel_name
            )
            await self.accept()
            logger.info(f"WebSocket connection accepted for lobby {self.lobby_id}")

            # Notify other clients in the lobby to refresh
            await self.send_refresh_message()

        except Exception as e:
            logger.info(f"Error during connection setup: {e}")
            await self.close()

    async def disconnect(self, close_code):
        logger.info(f"Disconnect called with code: {close_code}")
        if self.lobby_id in LobbyConsumer.connected_clients:
            LobbyConsumer.connected_clients[self.lobby_id].discard(self.channel_name)
            if not LobbyConsumer.connected_clients[self.lobby_id]:
                del LobbyConsumer.connected_clients[self.lobby_id]

        await self.channel_layer.group_discard(
            self.lobby_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket connection closed with code: {close_code} for lobby {self.lobby_id}")

    async def receive(self, text_data=None):
        if text_data:
            data = json.loads(text_data)
            message_type = data.get('type')

            # Handle different types of messages here
            if message_type == 'example_message':
                # Example of processing a generic message
                response = {'status': 'received', 'data': data}
                await self.send(text_data=json.dumps(response))
                
            elif message_type == 'reload':
                # Handle the reload message type
                await self.send_message('reload')

            elif message_type == 'start':
                # Handle the start message type
                await self.send_start_message()

    async def send_message(self, message_type):
        # Prepare the message structure
        message = {
            'type': message_type
        }
        await self.send(text_data=json.dumps(message))

    async def send_refresh_message(self):
        # Notify all clients in the group
        await self.channel_layer.group_send(
            self.lobby_group_name,
            {
                'type': 'send_message',
                'message': 'refresh'
            }
        )

    async def send_start_message(self):
        # Notify all clients in the group
        await self.channel_layer.group_send(
            self.lobby_group_name,
            {
                'type': 'send_message',
                'message': 'start'
            }
        )

    async def send_message(self, event):
        # Send message to WebSocket
        message = event['message']
        await self.send(text_data=json.dumps({'type': message}))
