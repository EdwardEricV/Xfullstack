from rest_framework import viewsets
from posts.models import PostModel
from rest_framework import status
from posts.serializers import PostSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import action

class PostViewSet(viewsets.ModelViewSet):
    queryset = PostModel.objects.all()
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author == request.user:
            return super().destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    def get_serializer_class(self):
        return PostSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
            
    @action(detail=True, methods=["post"])
    def like_unlike_post(self, request, pk=None):
        post_to_like = self.get_object()
        user_who_liked = request.user

        if post_to_like.likes.filter(pk=user_who_liked.pk):
            post_to_like.likes.remove(user_who_liked)
            return Response(
                {"status": "unliked"}
            )
        else:
            post_to_like.likes.add(user_who_liked)
            return Response(
                {"status": "liked"}
            )
    
    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        post_to_comment = self.get_object()
        serializer = PostSerializer(data=request.data)

        if serializer.is_valid():
            comment = serializer.save(author=request.user, parent_post=post_to_comment)
            return Response({"status": "commented", "id": comment.id}, status=201)
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=["delete"], url_path="delete_comment/(?P<comment_pk>[^/.]+)")
    def delete_comment(self, request, pk=None, comment_pk=None):
        try:
            comment = PostModel.objects.get(pk=comment_pk, author=request.user)
            comment.delete()
            return Response({"status": "deleted"})
        except PostModel.DoesNotExist:
            return Response({"status": "not found"}, status=404)

    @action(detail=True, methods=["post"])
    def retweet(self, request, pk=None):
        try:
            retweeted_post = self.get_object()
            existing_retweet = PostModel.objects.filter(
                author=request.user,
                retweet_post=retweeted_post
            ).first()

            if existing_retweet:
                existing_retweet.delete()
                return Response({"status": "unretweet"})
            else:
                PostModel.objects.create(
                    author=request.user,
                    retweet_post=retweeted_post
                )
                return Response({"status": "retweeted"}, status=201)
        except ObjectDoesNotExist:
            return Response({"Error": "Retweet is not valid"}, status=404)

    @action(detail=False, methods=["get"])
    def search_posts(self, request, pk=None):
        q = request.query_params.get("q", "")
        posts = PostModel.objects.filter(post_body__icontains=q)[:20]
        serializer = self.get_serializer(posts, many=True)

        return Response(serializer.data)