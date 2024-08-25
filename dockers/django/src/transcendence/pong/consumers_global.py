from channels.generic.websocket import AsyncWebsocketConsumer
from pong.models import Message, CustomUser
import json

class GlobalConsumer(AsyncWebsocketConsumer):
	active_users = {}
	connected_clients = []

	async def connect(self):
		user = self.scope['user']
		if not user.is_authenticated:
			await self.close()
			return
		self.username = user.username
		GlobalConsumer.active_users[self.username] = True
		GlobalConsumer.connected_clients.append(self)
		await self.accept()
		await self.broadcast_active_users()

	async def disconnect(self, close_code):
		GlobalConsumer.connected_clients.remove(self)
		if self.username in GlobalConsumer.active_users:
			GlobalConsumer.active_users[self.username] = False
		await self.broadcast_active_users()

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		if text_data_json.get('type') == 'privmsg':
			message = text_data_json.get('message', None)
			target = text_data_json.get('target', None)
			if message and target and message.length() < 100 and target.length() <= 12:
				Message.objects.create(sender=self.username, recipient=target, content=message)
				await self.send_privmsg(message, target)

	async def send_privmsg(self, message, target):
			target_client = GlobalConsumer.connected_clients.get(target)
			
			if target_client:
				await target_client.send(text_data=json.dumps({
					'type': 'privmsg',
					'message': message,
					'sender': self.username,
					'recipient': target,
				}))

	async def broadcast_message(self, message):
		for client in GlobalConsumer.connected_clients:
			await client.send(text_data=json.dumps({
				'message': message,
				'active_users': GlobalConsumer.active_users
			}))

	async def broadcast_active_users(self):
		for client in GlobalConsumer.connected_clients:
			await client.send(text_data=json.dumps({
				'type': 'online_status',
				'active_users': GlobalConsumer.active_users
			}))
