from rest_framework import serializers
from posts.models import PostFilesModel

class PostFilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostFilesModel
        fields = "__all__"
