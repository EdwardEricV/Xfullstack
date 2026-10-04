from rest_framework import serializers
from users.models import UserModel

class UserUpdateSerializer(serializers.ModelSerializer):
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

    class Meta:
        model = UserModel
        fields = ["name", "profile_image","profile_banner", "bio", "password"]
        extra_kwargs = {
            "password": {
                    'write_only': True,
                    'required': False
                    }
        }