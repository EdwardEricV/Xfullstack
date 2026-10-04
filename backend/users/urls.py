from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, CustomTokenObtainPairView, CustomTokenRefreshView
from django.urls import path

router = DefaultRouter()

router.register(r'users', UserViewSet)

urlpatterns = [
    *router.urls,
    #path("token/", CustomTokenObtainPairView.as_view()),#
    #path("token/refresh/", CustomTokenRefreshView.as_view()),#
]