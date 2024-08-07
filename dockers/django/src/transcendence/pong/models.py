import datetime
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Add custom fields if needed
    bio = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'pong_user'  # Set a custom table name

class Profile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE, related_name='profile')
    displayName = models.CharField(max_length=50)
    avatarUrl = models.URLField(blank=True, null=True)
    totalScore = models.IntegerField(default=0)
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
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    startDate = models.DateTimeField()
    endDate = models.DateTimeField()
    winner = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='won_tournaments')

    class Meta:
        db_table = 'pong_tournament'  # Set a custom table name

    def __str__(self):
        return self.name

class Game(models.Model):
    id = models.AutoField(primary_key=True)
    player1 = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='games_as_player1')
    player2 = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='games_as_player2')
    winner = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='won_games')
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='games')
    player1Score = models.IntegerField(default=0)
    player2Score = models.IntegerField(default=0)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pong_game'  # Set a custom table name

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
