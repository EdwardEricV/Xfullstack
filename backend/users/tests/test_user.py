import pytest
from django.core.exceptions import ValidationError
from users.factories.user_factory import UserFactory
from users.serializers import UserSerializer
from rest_framework.test import APIClient

def test_following(db):
    user1 = UserFactory()
    user2 = UserFactory()

    assert not user1.is_following(user2)
    user1.follow(user2)
    assert user1.is_following(user2)

def test_unfollowing(db):
    user1 = UserFactory()
    user2 = UserFactory()

    user1.follow(user2)
    assert user1.is_following(user2)
    user1.unfollow(user2)
    assert not user1.is_following(user2)

def test_dont_follow_yourself(db):
    user1 = UserFactory()

    assert not user1.follow(user1)

def test_follow_someone_twice(db):
    user1 = UserFactory()
    user2 = UserFactory()

    assert user1.follow(user2)
    assert not user1.follow(user2)

def test_write_more_than_allowed(db):
    long_name = "0" * 121
    user = UserFactory.build(name=long_name)

    with pytest.raises(ValidationError):
        user.full_clean()

def test_serializer_username_validation(db):
    data = {
        'name': "guilherme",
        'username': "guilherme00",
        'birthday': '2000-01-01',
        'password': 'password12345',
        "email": "example@gmail.com"
    }

    serializer = UserSerializer(data=data)
    assert serializer.is_valid(), serializer.errors

def test_serializer_username_validation_with_wrong_username(db):
    data = {
        'name': "guilherme",
        'username': "guilherme 00",
        'birthday': '2000-01-01',
        'password': "password12345"
    }

    serializer = UserSerializer(data=data)
    assert not serializer.is_valid()
    assert "username" in serializer.errors

def test_followers_cont(db):
    user1 = UserFactory()
    user2 = UserFactory()

    user1.follow(user2)

    assert user1.followers.count() == 0
    assert user2.followers.count() == 1

def test_unfollowing_not_following(db):
    user1 = UserFactory()
    user2 = UserFactory()

    assert not user1.is_following(user2)
    user1.unfollow(user2)
    assert not user1.is_following(user2)

def test_follow_again_return_false(db):

    user1 = UserFactory()
    user2 = UserFactory()

    assert user1.follow(user2)
    assert not user1.follow(user2)

def test_api_get_requisition(db):
    client = APIClient()

    user = UserFactory()
    client.force_authenticate(user=user)

    response = client.get('/api/users/', format='json')

    assert response.status_code == 200

def test_api_post_requisition(db):
    client = APIClient()
    user = UserFactory.build()
    client.force_authenticate(user=user)

    data = {
        'username': user.username,
        'name': user.name,
        'password': user.password,
        'birthday': user.birthday,
        "email": user.email
    }

    response = client.post("/api/users/", data, format="json")
    assert response.status_code == 201

def test_user1_follow_user2(db):
    user1 = UserFactory()
    user2 = UserFactory()

    client = APIClient()
    client.force_authenticate(user=user1)

    response = client.post(f"/api/users/{user2.pk}/follow/", format="json")

    assert response.status_code == 200

def test_user1_unfollow_user2(db):
    user1 = UserFactory()
    user2 = UserFactory()

    client = APIClient()
    client.force_authenticate(user=user1)

    client.post(f"/api/users/{user2.pk}/follow/", format="json")
    response = client.post(f"/api/users/{user2.pk}/unfollow/", format="json")

    assert response.status_code == 200

def test_user1_cant_follow_yourself(db):
    user1 = UserFactory()
    client = APIClient()
    client.force_authenticate(user=user1)
    response = client.post(f"/api/users/{user1.pk}/follow/", format="json")
    assert response.status_code == 400

def test_user1_cant_unfollow_yourself(db):
    user1 = UserFactory()
    client = APIClient()
    client.force_authenticate(user=user1)
    response = client.post(f"/api/users/{user1.pk}/unfollow/", format="json")
    assert response.status_code == 400

def test_user1_cant_follow_twice(db):
    user1 = UserFactory()
    user2 = UserFactory()
    client = APIClient()
    client.force_authenticate(user=user1)
    client.post(f"/api/users/{user2.pk}/follow/", format="json")
    response = client.post(f"/api/users/{user2.pk}/follow/", format="json")
    assert response.status_code == 400

def test_get_single_user(db):
    user1 = UserFactory()

    client = APIClient()
    client.force_authenticate(user=user1)

    response = client.get(f"/api/users/{user1.pk}/", format="json")
    assert response.status_code == 200

def test_delete_user(db):
    user1 = UserFactory()

    client = APIClient()
    client.force_authenticate(user=user1)

    response = client.delete(f"/api/users/{user1.pk}/", format="json")

    assert response.status_code == 204

def test_search_inexistent_user(db):
    user1 = UserFactory()

    client = APIClient()
    client.force_authenticate(user=user1)
    
    client.delete(f"/api/users/{user1.pk}/", format="json")

    response = client.get(f"/api/users/{user1.pk}/", format="json")

    assert response.status_code == 404

def test_token_response_from_auth(db):
    user1 = UserFactory()
    client = APIClient()

    response = client.post('/api/token/', {
        'username': user1.username,
        'password': "senha123"
    })

    assert response.status_code == 200
    assert 'access' in response.data

def test_access_without_token(db):
    client = APIClient()
    response = client.get("/api/users/")
    assert response.status_code == 401

def test_endpoint_me(db):
    user1 = UserFactory()
    client = APIClient()

    response = client.post("/api/token/", {
        'username': user1.username,
        'password': "senha123"
    })

    client.credentials(HTTP_AUTHORIZATION="Bearer " + response.data["access"])

    response2 = client.get("/api/users/me/")

    assert response2.status_code == 200
    assert "name" in response2.data

def test_endpoint_me_without_logged(db):
    client = APIClient()

    response = client.get("/api/users/me/")

    assert response.status_code == 401

def test_unauthenticated_user_cannot_follow(db):
    user1 = UserFactory()
    client = APIClient()
    response = client.post(f"/api/users/{user1.pk}/follow/")
    assert response.status_code == 401

def test_unauthenticated_user_cannot_delete_user(db):
    user1 = UserFactory()
    client = APIClient()
    response = client.delete(f"/api/users/{user1.pk}/")
    assert response.status_code == 401

def test_user_cannot_delete_another_user(db):
    user1 = UserFactory()
    user2 = UserFactory()
    client = APIClient()
    client.force_authenticate(user=user1)

    response = client.delete(f"/api/users/{user2.pk}/")

    assert response.status_code == 403

def test_user_cannot_edit_another_user(db):
    user1 = UserFactory()
    user2 = UserFactory()
    client = APIClient()
    client.force_authenticate(user=user1)

    response = client.patch(f"/api/users/{user2.pk}/", {"name": "hacker"}, format="json")

    assert response.status_code == 403

def test_dont_create_a_user_without_email(db):
    client = APIClient()
    data = {
        'username': "guillerme",
        'name': "gui",
        'password': "passwordsupersafe",
        'birthday': "2000-1-1"
    }

    response = client.post("/api/users/", data, format="json")
    
    assert response.status_code == 400