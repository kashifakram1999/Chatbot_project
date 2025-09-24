from __future__ import annotations
import os, logging
from typing import Dict, Generator, Iterable, List, Optional, Tuple
from openai import OpenAI
from django.conf import settings

try:
    from chatbot.bot import build_system_prompt
except Exception:
    build_system_prompt = None  # type: ignore

log = logging.getLogger(__name__)

# ---------- OpenAI config ----------
OPENAI_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))
OPENAI_MAX_OUTPUT_TOKENS = int(os.getenv("OPENAI_MAX_OUTPUT_TOKENS", "1024"))

# ---------- Persona asset config ----------
BRONN_KB_PATH = os.getenv("BRONN_KB_PATH", os.path.join(settings.BASE_DIR, "..", "chatbot", "bronns_kb.jsonl"))
BRONN_STYLE_PATH = os.getenv("BRONN_STYLE_PATH", os.path.join(settings.BASE_DIR, "..", "chatbot", "bronns_style.yml"))
TYRION_KB_PATH = os.getenv("TYRION_KB_PATH", os.path.join(settings.BASE_DIR, "..", "chatbot", "tyrion_kb.jsonl"))
TYRION_STYLE_PATH = os.getenv("TYRION_STYLE_PATH", os.path.join(settings.BASE_DIR, "..", "chatbot", "tyrion_style.yml"))

ASSET_MAP: Dict[str, Tuple[str, str]] = {
    "bronn": (BRONN_KB_PATH, BRONN_STYLE_PATH),
    "tyrion": (TYRION_KB_PATH, TYRION_STYLE_PATH),
}

_client: Optional[OpenAI] = None
_assets_checked = False

def _check_assets_once() -> None:
    """Log presence of persona assets exactly once."""
    global _assets_checked
    if _assets_checked:
        return
    for name, (kb, style) in ASSET_MAP.items():
        kb_ok, style_ok = os.path.exists(kb), os.path.exists(style)
        if not kb_ok or not style_ok:
            log.warning("Persona assets missing for %s: KB(%s)=%s, STYLE(%s)=%s",
                        name, kb, kb_ok, style, style_ok)
        else:
            log.info("Persona assets OK for %s: kb=%s, style=%s", name, kb, style)
    _assets_checked = True

def _client_singleton() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI()  # reads OPENAI_API_KEY
        log.info("OpenAI ready: model=%s, temp=%s", OPENAI_MODEL, OPENAI_TEMPERATURE)
        _check_assets_once()
    return _client

# ---------- Public API used by views ----------

def stream_tokens(prompt: str, *, persona: Optional[str] = None, history: Optional[Iterable[Dict[str, str]]] = None) -> Generator[str, None, None]:
    messages = _assemble_messages(prompt, persona=(persona or "Bronn"), history=history)
    client = _client_singleton()
    try:
        stream = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            temperature=OPENAI_TEMPERATURE,
            max_tokens=OPENAI_MAX_OUTPUT_TOKENS,
            stream=True,
        )
        for chunk in stream:
            try:
                delta = chunk.choices[0].delta.content or ""
            except Exception:
                delta = ""
            if delta:
                yield delta
    except Exception as e:
        log.exception("OpenAI stream failed: %s", e)
        # Stay in-character even on failure:
        yield " … Hells. Something’s off. Try me again."

def complete_once(prompt: str, *, persona: Optional[str] = None, history: Optional[Iterable[Dict[str, str]]] = None) -> str:
    messages = _assemble_messages(prompt, persona=(persona or "Bronn"), history=history)
    client = _client_singleton()
    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=messages,
        temperature=OPENAI_TEMPERATURE,
        max_tokens=OPENAI_MAX_OUTPUT_TOKENS,
        stream=False,
    )
    return (resp.choices[0].message.content or "").strip()

# ---------- Message assembly ----------

def _assemble_messages(prompt: str, *, persona: str, history: Optional[Iterable[Dict[str, str]]]) -> List[Dict[str, str]]:
    msgs: List[Dict[str, str]] = []
    msgs.append({"role": "system", "content": _persona_system_prompt(persona, prompt)})
    if history:
        msgs.extend(_bound_history(history, max_pairs=8))
    msgs.append({"role": "user", "content": prompt})
    return msgs

def _persona_system_prompt(persona: str, latest_user_prompt: str) -> str:
    """Return the system prompt for the given persona, selecting the right assets."""
    persona_key = (persona or "Bronn").strip().lower()
    kb_path, style_path = ASSET_MAP.get(persona_key, ASSET_MAP["bronn"])
    if build_system_prompt:
        try:
            return build_system_prompt(
                character=persona,
                user_query=latest_user_prompt,  # may include [[OOC]]
                kb_path=kb_path,
                style_path=style_path,
                k=5,
            )
        except Exception as e:
            log.warning("build_system_prompt failed for %s (%s); falling back to strict IC.", persona, e)
    # STRICT IC fallback (never generic assistant)
    return (
        f"You are {persona}. Speak strictly in-character: terse, blunt, sardonic. "
        "Never call yourself an AI or assistant. "
        "Switch to brief narrator mode only if the user prefixes [[OOC]]."
    )

def _bound_history(history: Iterable[Dict[str, str]], *, max_pairs: int = 8) -> List[Dict[str, str]]:
    hist = list(history)
    if hist and hist[0].get("role") == "system":
        hist = hist[1:]
    return hist[-(2 * max_pairs):] if max_pairs > 0 else hist
