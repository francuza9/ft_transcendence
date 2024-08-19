from django.core.files import File  # Required to handle file fields
from django.core.management.base import BaseCommand
from django.conf import settings
from pong.models import Profile, Tournament, Game, Message, CustomUser
from django.utils import timezone
import os

class Command(BaseCommand):
	help = 'Populates the database with initial test data.'

	def handle(self, *args, **kwargs):
		# Create users
		user1 = CustomUser.objects.create_user(
			username='gtskitis',
			email='gtskitis@student.42angouleme.fr',
			password='gtskitis123'  # Automatically hashed
		)
		user2 = CustomUser.objects.create_user(
			username='marde-vr',
			email='marde-vr@student.42angouleme.fr',
			password='marde-vr123'  # Automatically hashed
		)
		user3 = CustomUser.objects.create_user(
			username='jwadie-a',
			email='jwadie-a@student.42angouleme.fr',
			password='jwadie-a123'  # Automatically hashed
		)

		avatar1_path = os.path.join(settings.MEDIA_ROOT, 'profile_pictures/Geo.png')
		avatar2_path = os.path.join(settings.MEDIA_ROOT, 'profile_pictures/Marijn.png')
		avatar3_path = os.path.join(settings.MEDIA_ROOT, 'profile_pictures/Joe.png')

		# Create profiles
		profile1 = Profile.objects.create(user=user1, displayName='George', totalScore=15)
		profile2 = Profile.objects.create(user=user2, displayName='Marijn', totalScore=10)
		profile3 = Profile.objects.create(user=user3, displayName='Youssef', totalScore=5)

		with open(avatar1_path, 'rb') as avatar1_file:
			profile1.avatarUrl.save('Geo.png', File(avatar1_file), save=True)

		with open(avatar2_path, 'rb') as avatar2_file:
			profile2.avatarUrl.save('Marijn.png', File(avatar2_file), save=True)

		with open(avatar3_path, 'rb') as avatar3_file:
			profile3.avatarUrl.save('Joe.png', File(avatar3_file), save=True)
		
		# Create a tournament
		tournament = Tournament.objects.create(
			name='Summer Tournament',
			startDate=timezone.now(),
			endDate=timezone.now() + timezone.timedelta(days=10)
		)

		# Create games
		Game.objects.create(player1=user1, player2=user2, tournament=tournament, player1Score=15, player2Score=10)
		Game.objects.create(player1=user2, player2=user3, tournament=tournament, player1Score=15, player2Score=14)
		Game.objects.create(player1=user3, player2=user1, tournament=tournament, player1Score=15, player2Score=13)

		# Create messages
		Message.objects.create(sender=user1, recipient=user2, content='Hello, how are you?')
		Message.objects.create(sender=user2, recipient=user1, content='I am fine, thank you!')
		Message.objects.create(sender=user1, recipient=user3, content='Hello, how are you?')
		Message.objects.create(sender=user2, recipient=user3, content='Fuck off please')

		self.stdout.write(self.style.SUCCESS('Successfully populated initial data with hashed passwords.'))
