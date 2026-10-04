from django.db import models
from django.contrib.auth.models import AbstractUser

class UserModel(AbstractUser):

    id = models.BigAutoField(primary_key=True)

    class Meta:
        ordering = ["-id"]

    name = models.CharField(
        max_length=120,
        blank=False,
        null=False,
    )

    email = models.EmailField(
        blank=False,
        null=False
    )

    profile_image = models.ImageField(
        blank=True,
        null=True,
        default='default_profile_images/profile.png',
        upload_to='profiles_images/',
    )

    profile_banner = models.ImageField(
        blank=True,
        null=True,
        default='default_profile_images/banner.png',
        upload_to='profile_banners/',
    )

    bio = models.TextField(
        blank=True,
        null=True,
        max_length=900
    )

    created_at = models.DateField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    birthday = models.DateField(
        blank=False,
        null=False
    )

    following = models.ManyToManyField(
        "self",
        symmetrical=False,
        related_name="followers",
        blank=True
    )

    def is_following(self, target_user):
        return self.following.filter(pk=target_user.pk).exists()

    def follow(self, target_user):
        if target_user != self and not self.is_following(target_user):
            self.following.add(target_user)
            return True
        return False

    def unfollow(self, target_user):
        if target_user != self:
            self.following.remove(target_user)
            return True
        return False

    def __str__(self):
        return self.username