from __future__ import annotations

from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from django.urls import reverse
from .models import Conversation, Message

# ---- Admin site branding (helps orientation / a11y) ----
admin.site.site_header = "Chatbot Admin"
admin.site.site_title = "Chatbot Admin"
admin.site.index_title = "Overview"

# ---- Inline: show recent messages on the Conversation page ----
class MessageInline(admin.TabularInline):
    model = Message
    fields = ("role", "short_content", "created_at")
    readonly_fields = ("role", "short_content", "created_at")
    extra = 0
    can_delete = False
    show_change_link = True
    ordering = ("created_at",)

    @admin.display(description="Content")
    def short_content(self, obj: Message) -> str:
        text = (obj.content or "").strip().replace("\n", " ")
        return (text[:80] + "…") if len(text) > 80 else text


# ---- Conversation admin ----
@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    # clean, scannable list
    list_display = ("title_or_id", "character", "owner_link", "message_count", "created_at", "updated_at")
    list_filter = ("character", "created_at")
    search_fields = ("title", "owner__username", "owner__email", "id")
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 50
    list_select_related = ("owner",)
    raw_id_fields = ("owner",)  # avoids huge dropdowns; works with any user model

    # detail form
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Conversation", {"fields": ("title", "character", "owner")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    inlines = [MessageInline]

    def get_queryset(self, request):
        # annotate message counts for sorting/column
        qs = super().get_queryset(request)
        return qs.annotate(_message_count=Count("messages"))

    @admin.display(description="Messages", ordering="_message_count")
    def message_count(self, obj: Conversation) -> int:
        return getattr(obj, "_message_count", 0)

    @admin.display(description="Title")
    def title_or_id(self, obj: Conversation) -> str:
        # fall back to character + id if title is blank
        return obj.title or f"{obj.character} — {obj.id}"

    @admin.display(description="Owner")
    def owner_link(self, obj: Conversation):
        if not obj.owner_id:
            return "-"
        meta = obj.owner._meta
        url = reverse(f"admin:{meta.app_label}_{meta.model_name}_change", args=[obj.owner_id])
        label = getattr(obj.owner, "username", getattr(obj.owner, "email", str(obj.owner_id)))
        return format_html('<a href="{}">{}</a>', url, label)


# ---- Message admin ----
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "role", "short_content", "persona", "conversation_link", "created_at")
    list_filter = ("role", "conversation__character", "created_at")
    search_fields = (
        "content",
        "conversation__title",
        "conversation__id",
        "conversation__owner__username",
        "conversation__owner__email",
    )
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 50
    list_select_related = ("conversation", "conversation__owner")
    raw_id_fields = ("conversation",)
    readonly_fields = ("created_at",)
    fields = ("conversation", "role", "content", "meta", "created_at")

    @admin.display(description="Content")
    def short_content(self, obj: Message) -> str:
        text = (obj.content or "").strip().replace("\n", " ")
        return (text[:80] + "…") if len(text) > 80 else text

    @admin.display(description="Persona", ordering="conversation__character")
    def persona(self, obj: Message) -> str:
        # show the conversation's character (Bronn/Tyrion/etc.)
        return obj.conversation.character

    @admin.display(description="Conversation")
    def conversation_link(self, obj: Message):
        c = obj.conversation
        url = reverse(f"admin:{c._meta.app_label}_{c._meta.model_name}_change", args=[c.pk])
        label = c.title or f"{c.character} — {c.pk}"
        return format_html('<a href="{}">{}</a>', url, label)
