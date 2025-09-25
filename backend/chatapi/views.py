from rest_framework import generics, permissions, pagination
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Conversation, Message
from .serializers import ConversationSerializer, ConversationDetailSerializer, MessageSerializer

class StdPagination(pagination.PageNumberPagination):
    page_size = 20

class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StdPagination

    def get_queryset(self):
        return Conversation.objects.filter(owner=self.request.user).order_by("-updated_at")

    def perform_create(self, serializer):
        # Ensure a non-empty character; default to Bronn if UI doesn’t provide one
        character = (self.request.data.get("character") or "").strip() or "Bronn"
        conv = serializer.save(owner=self.request.user, character=character)
        return conv

class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Conversation.objects.filter(owner=self.request.user)

class ConversationMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = pagination.PageNumberPagination
    def get_queryset(self):
        conv = get_object_or_404(Conversation, pk=self.kwargs["pk"], owner=self.request.user)
        order = self.request.query_params.get("order","asc")
        self.pagination_class.page_size = int(self.request.query_params.get("page_size", 50))
        return conv.messages.all().order_by("created_at" if order=="asc" else "-created_at")

class CreateUserMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    def create(self, request, *args, **kwargs):
        conv = get_object_or_404(Conversation, pk=kwargs["pk"], owner=request.user)
        content = request.data.get("content","")
        msg = Message.objects.create(conversation=conv, role="user", content=content)
        if not conv.title:
            preview = (content.strip().split("\n",1)[0])[:60]
            prefix = (conv.character.strip() + " — ") if conv.character else ""
            conv.title = (prefix + preview).strip()
        conv.save(update_fields=["title","updated_at"])
        return Response(MessageSerializer(msg).data, status=201)


class ConversationBulkDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        qs = Conversation.objects.filter(owner=request.user)
        character = (request.query_params.get("character") or "").strip()
        if character:
            qs = qs.filter(character=character)
        count = qs.count()
        qs.delete()
        return Response({"deleted": count})
