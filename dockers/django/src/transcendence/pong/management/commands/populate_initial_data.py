from django.core.files import File  # Required to handle file fields
from django.core.management.base import BaseCommand
from django.conf import settings
from pong.models import Profile, Tournament, Game, MultiGame, Message, CustomUser
from django.utils import timezone
import random
import os

class Command(BaseCommand):
	help = 'Populates the database with initial test data.'

	def handle(self, *args, **kwargs):
		# Create users
		user1 = CustomUser.objects.create_user(
			username='gtskitis',
			email='gtskitis@student.42angouleme.fr',
			password='gtskitis123'
		)
		user2 = CustomUser.objects.create_user(
			username='marde-vr',
			email='marde-vr@student.42angouleme.fr',
			password='marde-vr123'
		)
		user3 = CustomUser.objects.create_user(
			username='jwadie-a',
			email='jwadie-a@student.42angouleme.fr',
			password='jwadie-a123'
		)
		user4 = CustomUser.objects.create_user(
			username='a',
			email='a@a.a',
			password='a'
		)
		user5 = CustomUser.objects.create_user(
			username='b',
			email='b@b.b',
			password='b'
		)
		user6 = CustomUser.objects.create_user(
			username='c',
			email='c@c.c',
			password='c'
		)

		user1.friends.add(user2)
		user1.friends.add(user3)
		user1.friends.add(user4)
		user2.friends.add(user3)
		user2.friends.add(user5)
		user3.friends.add(user6)

		user1.blocked_users.add(user5)
		user6.blocked_users.add(user1)

		user2.blocked_users.add(user6)
		user4.blocked_users.add(user2)

		user3.blocked_users.add(user4)
		user5.blocked_users.add(user3)

		avatar1_path = os.path.join(settings.MEDIA_ROOT, 'Geo.png')
		avatar2_path = os.path.join(settings.MEDIA_ROOT, 'Marijn.png')
		avatar3_path = os.path.join(settings.MEDIA_ROOT, 'Joe.png')
		avatar4_path = os.path.join(settings.MEDIA_ROOT, 'mr-potato.png')
		avatar5_path = os.path.join(settings.MEDIA_ROOT, 'side-eye.png')
		avatar6_path = os.path.join(settings.MEDIA_ROOT, 'butt.png')

		# Create profiles
		profile1 = Profile.objects.create(user=user1, displayName='George')
		profile2 = Profile.objects.create(user=user2, displayName='Marijn')
		profile3 = Profile.objects.create(user=user3, displayName='Youssef')
		profile4 = Profile.objects.create(user=user4, displayName='Alexander')
		profile5 = Profile.objects.create(user=user5, displayName='Bob')
		profile6 = Profile.objects.create(user=user6, displayName='Charles')


		with open(avatar1_path, 'rb') as avatar1_file:
			profile1.avatarUrl.save('Geo.png', File(avatar1_file), save=True)

		with open(avatar2_path, 'rb') as avatar2_file:
			profile2.avatarUrl.save('Marijn.png', File(avatar2_file), save=True)

		with open(avatar3_path, 'rb') as avatar3_file:
			profile3.avatarUrl.save('Joe.png', File(avatar3_file), save=True)

		with open(avatar4_path, 'rb') as avatar4_file:
			profile4.avatarUrl.save('mr-potato.png', File(avatar4_file), save=True)

		with open(avatar5_path, 'rb') as avatar5_file:
			profile5.avatarUrl.save('side-eye.png', File(avatar5_file), save=True)

		with open(avatar6_path, 'rb') as avatar6_file:
			profile6.avatarUrl.save('butt.png', File(avatar6_file), save=True)
		
		tournament = Tournament.objects.create(
			name='Summer Tournament',
			startDate=timezone.now(),
			endDate=timezone.now() + timezone.timedelta(days=10)
		)

		# Create guest users
		guest1 = CustomUser.create_guest_user()
		guest2 = CustomUser.create_guest_user()

		# Create bot users
		bot1 = CustomUser.create_bot_user()
		bot2 = CustomUser.create_bot_user()

		# Create a list of all possible players, including bots and guests
		players = [user1, user2, user3, user4, user5, user6, guest1, guest2, bot1, bot2]

		# Create 20 random games with scores up to 11
		for i in range(50):
			player1, player2 = random.sample(players, 2)  # Randomly select two different players
			player1_score = random.randint(0, 11)
			player2_score = random.randint(0, 11)

			# Ensure that there's a winner (no ties)
			while player1_score == player2_score:
				player2_score = random.randint(0, 11)

			# Determine the winner
			winner = player1 if player1_score > player2_score else player2

			# Determine if the game includes bots
			has_bots = player1.username.startswith('bot') or player2.username.startswith('bot')

			# Create the game object (no tournament, flag for bots)
			Game.objects.create(
				player1=player1,
				player2=player2,
				player1Score=player1_score,
				player2Score=player2_score,
				winner=winner,
				has_bots=has_bots,
				is_tournament=False
			)
			if has_bots == False:
				if not player1.username.startswith('guest'):
					profile1 = Profile.objects.get(user=player1)
					profile1.gamesPlayed += 1
					if winner == player1:
						profile1.gamesWon += 1
					else:
						profile1.gamesLost += 1
					profile1.save()

				if not player2.username.startswith('guest'):
					profile2 = Profile.objects.get(user=player2)
					profile2.gamesPlayed += 1
					if winner == player2:
						profile2.gamesWon += 1
					else:
						profile2.gamesLost += 1
					profile2.save()

		self.stdout.write(self.style.SUCCESS('Successfully populated random games with players, guests, and bots.'))

		# Create messages
		Message.objects.create(sender=user1, recipient=user2, content='Hello, how are you?')
		Message.objects.create(sender=user2, recipient=user1, content='I am fine, thank you!')
		Message.objects.create(sender=user1, recipient=user3, content='Hello, how are you?')
		Message.objects.create(sender=user3, recipient=user1, content='Fuck off please')
		Message.objects.create(sender=user2, recipient=user3, content='Got some coke?')
		Message.objects.create(sender=user3, recipient=user2, content='No, come tomorrow')

		self.stdout.write(self.style.SUCCESS('Successfully populated initial data'))