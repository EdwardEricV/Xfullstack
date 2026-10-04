import factory
from users.models import UserModel

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserModel
        skip_postgeneration_save = False
    
    name = factory.Faker('name')
    username = factory.Faker('user_name')
    email = factory.Faker("email")
    bio = factory.Faker('text', max_nb_chars=200)
    birthday = factory.Faker('date_of_birth', minimum_age=18, maximum_age=80)
    password = factory.PostGenerationMethodCall("set_password", "senha123")

    