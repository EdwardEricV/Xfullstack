from rest_framework import serializers
from users.models import UserModel
from rest_framework.exceptions import ValidationError

class UserMiniSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = [
            "id",
            "username",
            "name",
            "profile_image",
            "is_following",
            "bio"
        ]

    def get_is_following(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        return obj.followers.filter(id=request.user.id).exists()

class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    followers = serializers.SerializerMethodField()
    following = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()


    # Defs
    def get_is_following(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        return obj.followers.filter(id=request.user.id).exists()

    def get_followers(self, obj):
        return UserMiniSerializer(
            obj.followers.all(),
            many=True,
            context=self.context
        ).data
    
    def get_following(self, obj):
        return UserMiniSerializer(
            obj.following.all(),
            many=True,
            context=self.context
        ).data
    
    def get_followers_count(self, obj):
        return obj.followers.count()
    
    def get_following_count(self, obj):
        return obj.following.count()
    
    def validate_username(self, value):
        if ' ' in value:
            raise serializers.ValidationError("The username cannot contain spaces.")
        return value
    
    def create(self, validated_data):
        email = validated_data.pop('email', None)

        if not email:
            raise ValidationError({"email": "this field is required"})

        password = validated_data.pop('password', None)
        user = UserModel(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    # Classes
    class Meta:
        model = UserModel
        fields = ["id","name", "email", "username", "profile_image", "profile_banner", "bio", "followers_count", "following", "followers", "is_following", "following_count", "password", "birthday", "created_at"]
        read_only_fields = ['created_at', 'id']
        extra_kwargs = {
            'password': {"write_only": True, "required":True}
        }