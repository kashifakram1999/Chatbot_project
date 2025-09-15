from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.db.models import Q
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

# Google
from google.oauth2 import id_token
from google.auth.transport import requests as g_requests
from django.conf import settings

User = get_user_model()

def _jwt_for(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {"id": user.id, "email": getattr(user, "email", "")},
    }

def _has_field(model, field_name: str) -> bool:
    try:
        model._meta.get_field(field_name)
        return True
    except Exception:
        return False

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        password = request.data.get("password") or ""
        if not email or not password:
            return Response({"detail": "email/password required"}, status=400)

        # Determine which field the user model uses for login
        username_field = getattr(User, "USERNAME_FIELD", "username")

        # If your model is the default Django User, it needs a username.
        # We'll set username=email by default.
        create_kwargs = {username_field: email}
        if _has_field(User, "email"):
            create_kwargs["email"] = email

        # Check for existing user using either username or email
        exists_q = Q(**{f"{username_field}__iexact": email})
        if _has_field(User, "email"):
            exists_q |= Q(email__iexact=email)
        if User.objects.filter(exists_q).exists():
            return Response({"detail": "email already registered"}, status=400)

        try:
            user = User.objects.create_user(password=password, **create_kwargs)
        except TypeError as e:
            # In case some custom user requires extra fields
            return Response({"detail": f"registration failed: {e}"}, status=400)
        except IntegrityError:
            return Response({"detail": "email already registered"}, status=400)
        except Exception as e:
            return Response({"detail": f"registration failed: {e}"}, status=400)

        return Response(_jwt_for(user), status=201)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ident = (request.data.get("email") or "").strip()  # identifier: email OR username
        password = request.data.get("password") or ""
        if not ident or not password:
            return Response({"detail": "email/password required"}, status=400)

        username_field = getattr(User, "USERNAME_FIELD", "username")

        # Try matching either username or email
        lookup = Q(**{f"{username_field}__iexact": ident})
        if _has_field(User, "email"):
            lookup |= Q(email__iexact=ident)

        try:
            user = User.objects.get(lookup)
        except User.DoesNotExist:
            return Response({"detail": "invalid credentials"}, status=400)

        if not user.check_password(password):
            return Response({"detail": "invalid credentials"}, status=400)

        return Response(_jwt_for(user))


class MeView(APIView):
    def get(self, request):
        return Response({"id": request.user.id, "email": getattr(request.user, "email", "")})


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("id_token")
        if not token:
            return Response({"detail": "id_token required"}, status=400)
        try:
            info = id_token.verify_oauth2_token(
                token, g_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
            )
            email = info.get("email")
            if not email:
                return Response({"detail": "email missing in Google token"}, status=400)

            username_field = getattr(User, "USERNAME_FIELD", "username")
            # Find by either username/email
            lookup = Q(**{f"{username_field}__iexact": email})
            if _has_field(User, "email"):
                lookup |= Q(email__iexact=email)

            try:
                user = User.objects.get(lookup)
            except User.DoesNotExist:
                # Create new user; set username=email if needed
                create_kwargs = {username_field: email}
                if _has_field(User, "email"):
                    create_kwargs["email"] = email
                user = User.objects.create_user(**create_kwargs)
            return Response(_jwt_for(user))
        except Exception:
            return Response({"detail": "invalid google token"}, status=400)