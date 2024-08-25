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
		type = text_data_json.get('type', None)
		if type == 'privmsg':
			message = text_data_json.get('message', None)
			target = text_data_json.get('target', None)
			if message and target and message.length() < 100 and target.length() <= 12:
				Message.objects.create(sender=self.username, recipient=target, content=message)
				await self.send_privmsg(message, target)
		elif type == 'friend_request':
			target = text_data_json.get('target', None)
			if target and 0 < target.length() <= 12:
				await self.send_friend_request(target)
		elif type == 'friend_removal':
			target = text_data_json.get('target', None)
			if target and 0 < target.length() <= 12:
				await self.send_friend_removal(target)
		elif type == 'block':
			target = text_data_json.get('target', None)
			if target and 0 < target.length() <= 12:
				await self.send_block(target)
		elif type == 'unblock':
			target = text_data_json.get('target', None)
			if target and 0 < target.length() <= 12:
				await self.unblock(target)

	async def send_friend_request(self, target):
		senderDB = await self.getUserDB(self.username)
		userDB = await self.getUserDB(target)
		userWS = await self.getUserWS(target)
		if senderDB and userDB:
			if not senderDB.friends.filter(id=userDB.id).exists() \
				and not userDB.blocked_list.filter(id=senderDB.id).exists() \
				and not senderDB.blocked_list.filter(id=userDB.id).exists():
				await userWS.send(text_data=json.dumps({
					'type': 'friend_request',
					'sender': self.username,
				}))

	async def unblock(self, target):
		senderDB = await self.getUserDB(self.username)
		userDB = await self.getUserDB(target)
		if senderDB and userDB:
			if senderDB.blocked_users.filter(id=userDB.id).exists():
				senderDB.blocked_users.remove(userDB)

	async def send_block(self, target):
		senderDB = await self.getUserDB(self.username)
		userDB = await self.getUserDB(target)
		userWS = await self.getUserWS(target)
		if senderDB and userDB and userWS:
			if not senderDB.blocked_users.filter(id=userDB.id).exists() \
				and not userDB.blocked_users.filter(id=senderDB.id).exists():
				senderDB.blocked_users.add(userDB)
				senderDB.friends.remove(userDB)
				await userWS.send(text_data=json.dumps({
					'type': 'block',
					'sender': self.username,
				}))

	async def send_privmsg(self, message, target):
		target_client = await self.getUserWS(target)
		senderDB = await self.getUserDB(self.username)
		userDB = await self.getUserDB(target)
		if target_client and senderDB and userDB:
			if senderDB.friends.filter(id=userDB.id).exists() \
				and not senderDB.blocked_users.filter(id=userDB.id).exists() \
				and not userDB.blocked_users.filter(id=senderDB.id).exists():
				await target_client.send(text_data=json.dumps({
					'type': 'privmsg',
					'message': message,
					'sender': self.username,
					'recipient': target,
				}))

	async def send_friend_removal(self, target):
		senderDB = await self.getUserDB(self.username)
		userDB = await self.getUserDB(target)
		userWS = await self.getUserWS(target)
		if senderDB and userDB and userWS:
			if senderDB.friends.filter(id=userDB.id).exists():
				senderDB.friends.remove(userDB)
				await userWS.send(text_data=json.dumps({
					'type': 'friend_removal',
					'sender': self.username,
				}))

	async def broadcast_active_users(self):
		for client in GlobalConsumer.connected_clients:
			await client.send(text_data=json.dumps({
				'type': 'online_status',
				'active_users': GlobalConsumer.active_users
			}))

	async def getUserDB(self, target):
		user = CustomUser.objects.get(username=target)
		return user

	async def getUserWS(self, target):
		for client in GlobalConsumer.connected_clients:
			if client.username == target:
				return client
		return None
