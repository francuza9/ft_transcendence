import datetime
from django.db import models
from django.utils import timezone


class User(models.Model):
	id = models.AutoField(primary_key=True)
	username = models.CharField(max_length=50, unique=True)
	email = models.EmailField(unique=True)
	passwordHash = models.CharField(max_length=255)
	createdAt = models.DateTimeField(auto_now_add=True)
	updatedAt = models.DateTimeField(auto_now=True)
	def __str__(self):
		return self.username


class Profile(models.Model):
	id = models.AutoField(primary_key=True)
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
	displayName = models.CharField(max_length=50)
	avatarUrl = models.URLField(blank=True, null=True)
	totalScore = models.IntegerField(default=0)
	gamesPlayed = models.IntegerField(default=0)
	gamesWon = models.IntegerField(default=0)
	gamesLost = models.IntegerField(default=0)
	createdAt = models.DateTimeField(auto_now_add=True)
	updatedAt = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.displayName


class Tournament(models.Model):
	id = models.AutoField(primary_key=True)
	name = models.CharField(max_length=50)
	startDate = models.DateTimeField()
	endDate = models.DateTimeField()
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_tournaments')

	def __str__(self):
		return self.name


class Game(models.Model):
	id = models.AutoField(primary_key=True)
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player1')
	player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games_as_player2')
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_games')
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='games')
	player1Score = models.IntegerField(default=0)
	player2Score = models.IntegerField(default=0)
	createdAt = models.DateTimeField(auto_now_add=True)
	updatedAt = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Game between {self.player1} and {self.player2} in {self.tournament}"


class Message(models.Model):
	id = models.AutoField(primary_key=True)
	sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
	recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
	content = models.TextField()
	createdAt = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Message from {self.sender} to {self.recipient} at {self.createdAt}"
	
