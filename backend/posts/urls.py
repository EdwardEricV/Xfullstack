from rest_framework.routers import DefaultRouter
from posts.views import PostViewSet, FeedView
from django.urls import path

router = DefaultRouter()

router.register(r"posts", PostViewSet)

urlpatterns = [
    *router.urls,
    path('feed/', FeedView.as_view())
]