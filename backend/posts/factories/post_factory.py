import factory
from posts.models import PostModel
from users.factories import UserFactory

class PostFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PostModel
        skip_postgeneration_save = False
    
    author = factory.SubFactory(UserFactory)
    post_body = factory.Faker("text", max_nb_chars=500)
    