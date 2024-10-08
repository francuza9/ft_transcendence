from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from .utils import UploadTo
from django.db import models

class CustomUser(AbstractUser):
    github_id = models.PositiveIntegerField(null=True, blank=True, unique=True)
    forty_two_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    github_token = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True, max_length=64)
    is_guest = models.BooleanField(default=False)
    is_bot = models.BooleanField(default=False)
    friends = models.ManyToManyField('self', blank=True)
    sent_friend_requests = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='received_friend_requests')
    blocked_users = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='blocked_by')

    class Meta:
        db_table = 'users'

    @classmethod
    def generate_unique_username(cls, prefix):
        import random
        import string
        
        while True:
            username = f"{prefix}{''.join(random.choices(string.digits, k=6))}"
            if not cls.objects.filter(username=username).exists():
                return username

    @classmethod
    def create_guest_user(cls, username_prefix="guest"):
        guest_username = cls.generate_unique_username(username_prefix)

        guest_user = cls.objects.create_user(
            username=guest_username,
            email=None,
            password=None,
            is_guest=True
        )
        return guest_user
    
    @classmethod
    def create_bot_user(cls, username_prefix="bot"):
        bot_username = cls.generate_unique_username(username_prefix)

        bot_user = cls.objects.create_user(
            username=bot_username,
            email=None,
            password=None,
            is_bot=True
        )
        return bot_user

    def __str__(self):
        return self.username
    
class Profile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE, related_name='profile')
    displayName = models.CharField(max_length=50, default='displayName', blank=True)
    avatarUrl = models.ImageField(upload_to=UploadTo('profile_pictures/'), blank=True, null=True)
    bio = models.TextField(blank=True, default='', max_length=200) 
    gamesPlayed = models.IntegerField(default=0)
    gamesWon = models.IntegerField(default=0)
    gamesLost = models.IntegerField(default=0)
    multiGamesWon = models.IntegerField(default=0)
    tournamentsWon = models.IntegerField(default=0)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'

    def save(self, *args, **kwargs):
        if len(self.bio) > 500:
            raise ValueError("Bio cannot exceed 500 characters.")

        if not self.displayName or self.displayName == 'displayName':
            self.displayName = self.user.username

        super().save(*args, **kwargs)

    def __str__(self):
        return self.displayName

class Tournament(models.Model):
    name = models.CharField(max_length=255)
    startDate = models.DateTimeField(default=timezone.now)
    endDate = models.DateTimeField(null=True, blank=True)
    has_bots = models.BooleanField(default=False)
    max_players = models.PositiveIntegerField(default=8)
    winner = models.ForeignKey(
        CustomUser, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name='won_tournaments'
    )  

    class Meta:
        db_table = 'tournaments'

    def __str__(self):
        return self.name

class PlayerTournament(models.Model):
    player = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    round_eliminated = models.PositiveIntegerField(null=True, blank=True)  # The round they were eliminated in

    class Meta:
        unique_together = ('player', 'tournament')  # Ensure a player can only participate once in a tournament
        db_table = 'player_tournament'  # Set a custom table name

    def __str__(self):
        return f"{self.player.username} in {self.tournament.name} - Round Eliminated: {self.round_eliminated}"

class Game(models.Model):
    id = models.AutoField(primary_key=True)
    player1 = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='games_as_player1')
    player2 = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='games_as_player2')
    winner = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='won_games')
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='games', null=True, blank=True)
    has_bots = models.BooleanField(default=False)
    is_tournament = models.BooleanField(default=False)
    player1Score = models.IntegerField(default=0)
    player2Score = models.IntegerField(default=0)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'games'  # Set a custom table name

    def __str__(self):
        return f"Game between {self.player1} and {self.player2}"

class MultiGame(models.Model):
    players = models.ManyToManyField(
        CustomUser,
        related_name='multi_games',
        blank=False
    )
    winner = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='won_multigames'
    )
    has_bots = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'multigames'  # Set a custom table name

    def clean(self):
        """
        Custom validation to ensure the number of players is between 3 and 8.
        """
        super().clean()
        # Validate number of players
        if not (3 <= self.players.count() <= 8):
            raise ValidationError('A MultiGame must have between 3 and 8 players.')

    def save(self, *args, **kwargs):
        self.full_clean()  # Ensure that clean method is called before saving
        super().save(*args, **kwargs)

    def __str__(self):
        return f"MultiGame created on {self.createdAt} with {self.players.count()} players"

class Message(models.Model):
    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient} at {self.createdAt}"
