import mongoengine as me
from datetime import datetime
from django.contrib.auth.hashers import make_password, check_password


class User(me.Document):
    # Champs d'information de base
    email = me.EmailField(required=True, unique=True)
    username = me.StringField(max_length=30, required=True, unique=True)
    first_name = me.StringField(max_length=30)
    last_name = me.StringField(max_length=30)

    # Champs de gestion
    joined_at = me.DateTimeField(default=datetime.utcnow)
    is_active = me.BooleanField(default=True)
    is_staff = me.BooleanField(default=False)
    is_superuser = me.BooleanField(default=False)

    # Photo de profil
    profile_picture = me.StringField(
        default="profile_pictures/default_profile.png"
    )

    # Mot de passe (hashé)
    password = me.StringField(required=True)

    meta = {
        "collection": "users"  # nom de la collection MongoDB
    }

    @classmethod
    def create_user(cls, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email doit être défini")
        user = cls(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save()
        return user

    @classmethod
    def create_superuser(cls, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return cls.create_user(email, password, **extra_fields)


    # -------------------
    # Méthodes utilitaires
    # -------------------
    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.username

