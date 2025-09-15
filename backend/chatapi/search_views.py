from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Conversation, Message

class SearchView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        q = (request.query_params.get("q") or "").strip()
        limit = int(request.query_params.get("limit", 20))
        if not q:
            return Response({"conversations": [], "messages": []})
        convs = (Conversation.objects
                 .filter(owner=request.user, title__icontains=q)
                 .order_by("-updated_at")[:limit]
                 .values("id","title","character","updated_at"))
        msgs = (Message.objects
                 .filter(conversation__owner=request.user, content__icontains=q)
                 .order_by("-created_at")[:limit]
                 .values("id","conversation_id","role","content","created_at"))
        return Response({"conversations": list(convs), "messages": list(msgs)})
