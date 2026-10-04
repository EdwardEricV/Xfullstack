from django.db import models
from users.models import UserModel
from django.core.exceptions import ValidationError

class PostModel(models.Model):

    class Meta:
        ordering = ["-created_at"]

    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(UserModel, related_name="posts", on_delete=models.CASCADE)
    post_body = models.CharField(
        default='',
        blank=True,
        max_length=500
    )
    likes = models.ManyToManyField(
        UserModel,
        related_name="liked_posts",
        blank=True
    )
    parent_post = models.ForeignKey(
        'self',
        related_name="comments",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    retweet_post = models.ForeignKey(
        'self',
        related_name="retweets",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    def clean(self):
        if self.parent_post and self.retweet_post:
            raise ValidationError(
                "Post cannot be comment and retweet simultaneously."
            )

        if self.retweet_post and self.retweet_post.retweet_post:
            raise ValidationError(
                "Cannot retweet a retweet."
            )

class PostFilesModel(models.Model):
    post = models.ForeignKey(PostModel, related_name="medias", on_delete=models.CASCADE)
    file = models.FileField(upload_to='posts_media/')
    order = models.PositiveIntegerField(default=0)