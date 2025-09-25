from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .auth_views import RegisterView, LoginView, MeView, GoogleAuthView
from .views import (
    ConversationListCreateView, ConversationDetailView,
    ConversationMessagesView, CreateUserMessageView,
    ConversationBulkDeleteView,
)
from .stream_views import chat_stream_view
from .search_views import SearchView

urlpatterns = [
    # Auth
    path("auth/register", RegisterView.as_view()),
    path("auth/login",    LoginView.as_view()),
    path("auth/refresh",  TokenRefreshView.as_view()),
    path("auth/google",   GoogleAuthView.as_view()),
    path("me",            MeView.as_view()),

    # Conversations & messages
    path("conversations",                        ConversationListCreateView.as_view()),
    path("conversations/<uuid:pk>",              ConversationDetailView.as_view()),
    path("conversations/<uuid:pk>/messages",     ConversationMessagesView.as_view()),
    path("conversations/<uuid:pk>/messages/create", CreateUserMessageView.as_view()),
    path("conversations/bulk-delete",            ConversationBulkDeleteView.as_view()),

    # Streaming
    path("chat/stream", chat_stream_view),

    # Search
    path("search", SearchView.as_view()),
]
