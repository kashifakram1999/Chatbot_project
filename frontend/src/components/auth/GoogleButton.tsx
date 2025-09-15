"use client";

import { useEffect, useRef } from "react";

type Props = {
  clientId?: string; // defaults to env
  onCredential: (idToken: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  type?: "standard" | "icon";
  shape?: "rectangular" | "pill" | "circle" | "square";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  logo_alignment?: "left" | "center";
};

export default function GoogleButton({
  onCredential,
  clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  text = "signin_with",
  type = "standard",
  shape = "pill",
  theme = "filled_black",
  size = "large",
  logo_alignment = "left",
}: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clientId) return;

    // load GIS script once
    const id = "google-gsi";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.id = id;
      document.head.appendChild(s);
      s.onload = init;
    } else {
      init();
    }

    function init() {
      // @ts-ignore
      if (!window.google || !window.google.accounts || !divRef.current) return;
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp: any) => {
          const token = resp?.credential;
          if (token) onCredential(token);
        },
        auto_select: false,
        ux_mode: "popup",
      });
      // @ts-ignore
      window.google.accounts.id.renderButton(divRef.current, {
        theme,
        size,
        text,
        type,
        shape,
        logo_alignment,
      });
    }
  }, [clientId, onCredential, text, type, shape, theme, size, logo_alignment]);

  return (
    <div className="w-full">
      <div ref={divRef} className="flex justify-center" />
    </div>
  );
}
