from django.core.management.base import BaseCommand
from django.conf import settings
from pong.models import Profile, Tournament, Game, Message, CustomUser
from django.utils import timezone

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

		# Create profiles
		Profile.objects.create(user=user1, displayName='George', avatarUrl='http://example.com/avatar1.jpg', totalScore=15)
		Profile.objects.create(user=user2, displayName='Marijn', avatarUrl='http://example.com/avatar2.jpg', totalScore=10)
		Profile.objects.create(user=user3, displayName='Youssef', avatarUrl='http://example.com/avatar3.jpg', totalScore=5)

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
