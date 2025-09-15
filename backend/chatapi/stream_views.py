import json
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Conversation, Message
from .services.bot_service import stream_tokens

def _evt(data: dict, event: str) -> bytes:
    return (f"event: {event}\n" f"data: {json.dumps(data, ensure_ascii=False)}\n\n").encode("utf-8")

@csrf_exempt
def chat_stream_view(request):
    # Manual JWT auth
    user = None
    try:
        user, _ = JWTAuthentication().authenticate(request)
    except Exception:
        pass
    if not user:
        return JsonResponse({"detail": "Unauthorized"}, status=401)

    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    try:
        body = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        body = {}

    conversation_id = body.get("conversation_id")
    prompt = body.get("prompt", "") or ""
    create_user_message = bool(body.get("create_user_message", True))
    if not conversation_id:
        return JsonResponse({"detail": "conversation_id required"}, status=400)

    conv = get_object_or_404(Conversation, pk=conversation_id, owner=user)

    # Persist user's message now (if not already created via /messages/create)
    if create_user_message and prompt:
        Message.objects.create(conversation=conv, role="user", content=prompt)
        conv.save(update_fields=["updated_at"])

    # Create assistant placeholder row (save-as-you-go)
    assistant = Message.objects.create(conversation=conv, role="assistant", content="")
    conv.save(update_fields=["updated_at"])

    # Short history (exclude the new empty assistant)
    history_qs = conv.messages.exclude(id=assistant.id).order_by("-created_at")[:12]
    history = [{"role": m.role, "content": m.content} for m in reversed(list(history_qs))]

    def stream():
        yield _evt({"message_id": assistant.id, "ts": now().isoformat()}, "start")
        persona = conv.character or "Bronn"
        for tok in stream_tokens(prompt, persona=persona, history=history):
            assistant.content += tok
            assistant.save(update_fields=["content"])
            yield _evt({"delta": tok}, "token")
        yield _evt({"ts": now().isoformat()}, "end")

    resp = StreamingHttpResponse(stream(), content_type="text/event-stream")
    resp["Cache-Control"] = "no-cache"
    resp["X-Accel-Buffering"] = "no"
    return resp
