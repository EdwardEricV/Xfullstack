from django.contrib import admin
from .models.users_model import UserModel
from django.contrib.auth.admin import UserAdmin
# Register your models here.

@admin.register(UserModel)
class UserModelAdmin(UserAdmin):

    list_display = (
        "username",
        "name",
        "email",
        "birthday",
        "is_staff",
        "is_active",
    )

    list_filter = (
        "is_staff",
        "is_active",
        "created_at",
    )

    search_fields = (
        "username",
        "name",
        "email",
    )

    ordering = ("-id",)

    fieldsets = (
        ("Informações de acesso", {
            "fields": (
                "username",
                "password",
            )
        }),

        ("Informações pessoais", {
            "fields": (
                "name",
                "email",
                "birthday",
                "bio",
            )
        }),

        ("Perfil", {
            "fields": (
                "profile_image",
                "profile_banner",
            )
        }),

        ("Relacionamentos", {
            "fields": (
                "following",
            )
        }),

        ("Permissões", {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),

        ("Datas", {
            "fields": (
                "last_login",
                "date_joined",
                "created_at",
            )
        }),
    )

    add_fieldsets = (
        ("Criar usuário", {
            "classes": ("wide",),
            "fields": (
                "username",
                "name",
                "email",
                "birthday",
                "password1",
                "password2",
            ),
        }),
    )