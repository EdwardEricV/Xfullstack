from rest_framework import serializers
from posts.models import PostModel
from users.models import UserModel

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ["id", "name", "username", "profile_image"]
        read_only_fields = ['created_at', 'id']

class FeedSerializer(serializers.ModelSerializer):  
    likes_count = serializers.SerializerMethodField()
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    author = UserSerializer(read_only=True)

    liked_by_me = serializers.SerializerMethodField()
    def get_liked_by_me(self, obj):
        if obj.likes.filter(pk=self.context["request"].user.pk).exists():
            return True
        return False

    class Meta:
        model = PostModel
        fields = ["created_at", "author", "post_body", "likes_count", "liked_by_me"]