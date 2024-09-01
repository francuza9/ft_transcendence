from channels.generic.websocket import AsyncWebsocketConsumer
from pong.models import Message, CustomUser
from asgiref.sync import sync_to_async
import json

class GlobalConsumer(AsyncWebsocketConsumer):
	active_users = {}
	connected_clients = []

	async def connect(self):
		user = self.scope['user']
		self.username = None
		if not user.is_authenticated:
			await self.close()
			return
		self.username = user.username
		GlobalConsumer.active_users[self.username] = True
		GlobalConsumer.connected_clients.append(self)
		await self.accept()
		await self.broadcast_active_users()

	async def disconnect(self, close_code):
		if self in GlobalConsumer.connected_clients:
			GlobalConsumer.connected_clients.remove(self)
		if self.username and self.username in GlobalConsumer.active_users:
			GlobalConsumer.active_users[self.username] = False
		await self.broadcast_active_users()

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		type = text_data_json.get('type', None)
		if type == 'privmsg':
			message = text_data_json.get('message', None)
			target = text_data_json.get('target', None)
			if message and target and len(message) < 1000 and len(target) <= 12:
				await self.send_privmsg(message, target)
		elif type == 'friend_request':
			target = text_data_json.get('target', None)
			if target and 0 < len(target) <= 12:
				await self.send_friend_request(target)
		elif type == 'friend_removal':
			target = text_data_json.get('target', None)
			if target and 0 < len(target) <= 12:
				await self.send_friend_removal(target)
		elif type == 'block':
			target = text_data_json.get('target', None)
			if target and 0 < len(target) <= 12:
				await self.send_block(target)
		elif type == 'unblock':
			target = text_data_json.get('target', None)
			if target and 0 < len(target) <= 12:
				await self.unblock(target)
		elif type == 'game_invitation':
			target = text_data_json.get('target', None)
			url = text_data_json.get('url', None)
			if target and url and 0 < len(target) <= 12 and 0 < len(url) <= 40:
				await self.send_game_invitation(target, url)

	async def send_friend_request(self, target):
		senderDB = await self.getUserDB(self.username)
		userDB = await self.getUserDB(target)
		userWS = await self.getUserWS(target)
		if not userDB:
			await self.send(text_data=json.dumps({
				'type': 'friend_request_sent',
				'content': False,
			}))
		if senderDB and userDB:
			if not await sync_to_async(senderDB.friends.filter(id=userDB.id).exists)() \
				and not await sync_to_async(userDB.sent_friend_requests.filter(id=senderDB.id).exists)() \
				and not await sync_to_async(userDB.received_friend_requests.filter(id=senderDB.id).exists)() \
				and not await sync_to_async(userDB.blocked_users.filter(id=senderDB.id).exists)() \
				and not await sync_to_async(senderDB.blocked_users.filter(id=userDB.id).exists)():
				await sync_to_async(senderDB.sent_friend_requests.add)(userDB)
				await userWS.send(text_data=json.dumps({
					'type': 'friend_request',
					'sender': self.username,
				}))
				await self.send(text_data=json.dumps({
					'type': 'friend_request_sent',
					'content': True,
				}))

	async def send_game_invitation(self, target, url):
		userWS = await self.getUserWS(target)
		userDB = await self.getUserDB(target)
		senderDB = await self.getUserDB(self.username)
		if userWS and userDB and senderDB:
			if not await sync_to_async(senderDB.blocked_users.filter(id=userDB.id).exists)() \
				and not await sync_to_async(userDB.blocked_users.filter(id=senderDB.id).exists)() \
				and await sync_to_async(senderDB.friends.filter(id=userDB.id).exists)():
				await self.send_privmsg(url, target)

	async def unblock(self, target):
		senderDB = await self.getUserDB(self.username)
		userDB = await self.getUserDB(target)
		if senderDB and userDB:
			if await sync_to_async(senderDB.blocked_users.filter(id=userDB.id).exists)():
				await sync_to_async(senderDB.blocked_users.remove)(userDB)

	async def send_block(self, target):
		senderDB = await self.getUserDB(self.username)
		userDB = await self.getUserDB(target)
		userWS = await self.getUserWS(target)
		if senderDB and userDB and userWS:
			if not await sync_to_async(senderDB.blocked_users.filter(id=userDB.id).exists)() \
				and not await sync_to_async(userDB.blocked_users.filter(id=senderDB.id).exists)():
				await sync_to_async(senderDB.blocked_users.add)(userDB)
				if await sync_to_async(senderDB.friends.filter(id=userDB.id).exists)():
					await sync_to_async(senderDB.friends.remove)(userDB)
				if await sync_to_async(userDB.sent_friend_requests.filter(id=senderDB.id).exists)():
					await sync_to_async(userDB.sent_friend_requests.remove)(senderDB)
				if await sync_to_async(userDB.received_friend_requests.filter(id=senderDB.id).exists)():
					await sync_to_async(userDB.received_friend_requests.remove)(senderDB)

	async def send_privmsg(self, message, target):
		target_client = await self.getUserWS(target)
		senderDB = await self.getUserDB(self.username)
		userDB = await self.getUserDB(target)
		if target_client and senderDB and userDB:
			if await sync_to_async(senderDB.friends.filter(id=userDB.id).exists)() \
				and not await sync_to_async(senderDB.blocked_users.filter(id=userDB.id).exists)() \
				and not await sync_to_async(userDB.blocked_users.filter(id=senderDB.id).exists)():
				await sync_to_async(Message.objects.create)(sender=senderDB, recipient=userDB, content=message)
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
			if await sync_to_async(senderDB.friends.filter(id=userDB.id).exists)():
				await sync_to_async(senderDB.friends.remove)(userDB)

	async def broadcast_active_users(self):
		for client in GlobalConsumer.connected_clients:
			await client.send(text_data=json.dumps({
				'type': 'online_status',
				'active_users': GlobalConsumer.active_users
			}))

	async def getUserDB(self, target):
		return await sync_to_async(CustomUser.objects.get)(username=target)

	async def getUserWS(self, target):
		for client in GlobalConsumer.connected_clients:
			if client.username == target:
				return client
		return None
