import datetime
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from .utils import UploadTo
from django.db import models
from django.conf import settings

class CustomUser(AbstractUser):
	github_id = models.PositiveIntegerField(null=True, blank=True, unique=True)
	github_token = models.CharField(max_length=255, blank=True, null=True)
	email = models.EmailField(blank=True, null=True)
	is_guest = models.BooleanField(default=False)

	class Meta:
		db_table = 'pong_user'  # Set a custom table name

	@classmethod
	def create_guest_user(cls, username_prefix="Guest"):
		"""Creates and returns a new guest user."""
		import random
		import string

		# Generate a random guest username
		guest_username = f"{username_prefix}{''.join(random.choices(string.digits, k=4))}"

		# Create the guest user with no email or password, and mark as guest
		guest_user = cls.objects.create_user(
			username=guest_username,
			email=None,
			password=None,
			is_guest=True
		)
		return guest_user

class Profile(models.Model):
	id = models.AutoField(primary_key=True)
	user = models.OneToOneField('CustomUser', on_delete=models.CASCADE, related_name='profile')
	displayName = models.CharField(max_length=50, default='displayName')
	avatarUrl = models.ImageField(upload_to=UploadTo('profile_pictures/'), blank=True, null=True)
	bio = models.TextField(blank=True, default='')
	gamesPlayed = models.IntegerField(default=0)
	gamesWon = models.IntegerField(default=0)
	gamesLost = models.IntegerField(default=0)
	createdAt = models.DateTimeField(auto_now_add=True)
	updatedAt = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = 'pong_profile'  # Set a custom table name

	def __str__(self):
		return self.displayName

class Tournament(models.Model):
	name = models.CharField(max_length=255)
	start_date = models.DateTimeField(default=timezone.now)
	end_date = models.DateTimeField(null=True, blank=True)
	has_bots = models.BooleanField(default=False)
	max_players = models.PositiveIntegerField(default=8)  # Maximum number of players allowed
	winner = models.ForeignKey(
		CustomUser, 
		null=True, 
		blank=True, 
		on_delete=models.SET_NULL, 
		related_name='won_tournaments'
	)  # Nullable, as the tournament may not have a winner yet

	def __str__(self):
		return self.name


# class PlayerTournament(models.Model):
# 	player = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
# 	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
# 	round_eliminated = models.PositiveIntegerField(null=True, blank=True)  # The round they were eliminated in

# 	class Meta:
# 		unique_together = ('player', 'tournament')  # Ensure a player can only participate once in a tournament

# 	def __str__(self):
# 		return f"{self.player.username} in {self.tournament.name} - Round Eliminated: {self.round_eliminated}"


class Game(models.Model):
	id = models.AutoField(primary_key=True)
	player1 = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='games_as_player1')
	player2 = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='games_as_player2')
	winner = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='won_games')
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='games')
	has_bots = models.BooleanField(default=False)
	is_tournament = models.BooleanField(default=False)
	player1Score = models.IntegerField(default=0)
	player2Score = models.IntegerField(default=0)
	createdAt = models.DateTimeField(auto_now_add=True)
	updatedAt = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = 'pong_game'  # Set a custom table name

	def __str__(self):
		return f"Game between {self.player1} and {self.player2} in {self.tournament}"
	
# class MultiGame(models.Model):
# 	id = models.AutoField(primary_key=True)
# 	player1 = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='games_as_player1')
# 	player2 = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='games_as_player2')
# 	winner = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='won_games')
# 	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='games')
# 	has_bots = models.BooleanField(default=False)
# 	is_tournament = models.BooleanField(default=False)
# 	player1Score = models.IntegerField(default=0)
# 	player2Score = models.IntegerField(default=0)
# 	createdAt = models.DateTimeField(auto_now_add=True)
# 	updatedAt = models.DateTimeField(auto_now=True)

# 	class Meta:
# 		db_table = 'pong_game'  # Set a custom table name

	def __str__(self):
		return f"Game between {self.player1} and {self.player2} in {self.tournament}"

class Message(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pong_message'  # Set a custom table name

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient} at {self.createdAt}"

