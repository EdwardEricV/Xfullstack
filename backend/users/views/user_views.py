from rest_framework import viewsets
from users.models import UserModel
from posts.models import PostModel
from users.serializers import UserSerializer, UserUpdateSerializer
from posts.serializers import PostSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from django.db.models import Q

class UserViewSet(viewsets.ModelViewSet):
    queryset = UserModel.objects.all()
    
    def get_permissions(self):
        if self.action in [
        "create",
        "list",
        "retrieve",
        "user_posts",
        "search_users",
    ]:
            return [AllowAny()]
        return[IsAuthenticated()]
    

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

        

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        if user == request.user:
            return super().destroy(request,*args, **kwargs)
        return Response(status=status.HTTP_403_FORBIDDEN)
    

    
    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return super().partial_update(request, *args, **kwargs)
        return Response(status=status.HTTP_403_FORBIDDEN)
    

    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if user != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserSerializer

    #decorators

    @action(detail=True, methods=["get"])
    def user_posts(self, request, pk=None):
        posts = PostModel.objects.filter(author__id=pk, parent_post__isnull=True)
        posts_serializered = PostSerializer(posts, many=True)
        return Response(posts_serializered.data)


    @action(detail=True, methods=["post"])
    def follow(self, request, pk=None):
        user_to_follow = self.get_object()
        current_user = request.user

        if current_user == user_to_follow:
            return Response(
                {"error": "You can't follow yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if current_user.follow(user_to_follow):
            return Response({"status": "followed"})

        return Response(
            {"error": "Already following"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=["post"])
    def unfollow(self, request, pk=None):
        current_user = request.user
        user_to_unfollow = self.get_object()

        if current_user == user_to_unfollow:
            return Response(
                {"error": "You can't unfollow yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if current_user.unfollow(user_to_unfollow):
            return Response({"status": "Unfollowed"})

        return Response(
            {"error": "You can't unfollow someone you don't follow"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=["get"])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=["get"])
    def search_users(self, request, pk=None):
        q = request.query_params.get("q", "")
        posts = UserModel.objects.filter(Q(username__icontains=q) | Q(name__icontains=q))[:20]
        serializer = self.get_serializer(posts, many=True)

        return Response(serializer.data)
    
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            refresh = response.data.get("refresh")
            response.data.pop("refresh", None)

            response.set_cookie(
                key="refresh_token",
                value=refresh,
                httponly=True,
                secure=True,
                samesite="None",
            )
        return response

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get("refresh_token")
        if not refresh:
            return Response({"error": "No refresh token"}, status=400)
        data = {"refresh": refresh}
        serializer = TokenRefreshSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data)
