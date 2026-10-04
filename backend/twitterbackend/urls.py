from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from users.views import CustomTokenObtainPairView, CustomTokenRefreshView
from django.views.static import serve
from django.urls import re_path


urlpatterns = [
    path("admin/", admin.site.urls),

    # Usuários
    path("api/", include("users.urls")),

    # Autenticação JWT
    path(
        "api/token/",
        CustomTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "api/token/refresh/",
        CustomTokenRefreshView.as_view(),
        name="token_refresh",
    ),

    # Posts
    path("api/", include("posts.urls")),
]

urlpatterns += [
    re_path(
        r"^media/(?P<path>.*)$",
        serve,
        {
            "document_root": settings.MEDIA_ROOT,
        },
    ),
]