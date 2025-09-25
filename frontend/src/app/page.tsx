"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CHARACTERS } from "@/lib/characters";
import { Card, CardBody } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import Hero from "@/components/Hero";

export default function HomePage() {
  const characters = CHARACTERS;
  return (
    <div className="space-y-16">
      {/* HERO */}
      <Hero />

      {/* ALL CHARACTERS (Auto Slider) */}
      <header className="relative rounded-2xl border border-[var(--border)] bg-card/70 p-10 shadow-soft text-center">
        <h1 className="text-3xl md:text-4xl font-semibold">All Characters</h1>
        <CharactersAutoSlider className="mt-10" characters={characters} />
      </header>

      {/* SIMPLE STRUCTURE BELOW */}
      <Section title="What makes it different?">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardBody className="p-5 text-center">
              <h3 className="font-semibold">Character Tone</h3>
              <p className="mt-2 text-sm text-muted">
                Bronn speaks with dry humor and blunt pragmatism.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-5 text-center">
              <h3 className="font-semibold">Streaming Replies</h3>
              <p className="mt-2 text-sm text-muted">
                Token-by-token responses keep the conversation natural.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-5 text-center">
              <h3 className="font-semibold">Simple to Use</h3>
              <p className="mt-2 text-sm text-muted">
                Log in, start chatting—no clutter, just answers.
              </p>
            </CardBody>
          </Card>
        </div>
      </Section>
    </div>
  );
}

type Character = { slug: string; name: string; image: string };

/**
 * CharactersAutoSlider
 * - Infinite looping via duplicated list
 * - Autoplay with requestAnimationFrame
 * - Pauses on hover or while dragging
 * - Drag to scroll (mouse & touch)
 * - Keeps your original image markup/styles
 */
function CharactersAutoSlider({
  characters,
  className = "",
  speed = 0.6, // px per frame (~36px/s)
}: {
  characters: Character[];
  className?: string;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Seamless loop by duplicating the array
  const items = [...characters, ...characters];

  // Autoplay loop
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const run = () => {
      if (!paused) {
        track.scrollLeft += speed;
        const half = track.scrollWidth / 2;
        if (track.scrollLeft >= half) {
          track.scrollLeft = track.scrollLeft - half;
        }
      }
      raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [paused, speed]);

  // Drag to scroll (mouse + touch)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      setPaused(true);
      el.classList.add("cursor-grabbing");
      startX = e.clientX;
      startScroll = el.scrollLeft;
      e.preventDefault();
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      el.scrollLeft = startScroll - dx;
    };
    const endMouse = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("cursor-grabbing");
      setPaused(false);
    };

    const onTouchStart = (e: TouchEvent) => {
      setPaused(true);
      isDown = true;
      startX = e.touches[0].clientX;
      startScroll = el.scrollLeft;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDown) return;
      const dx = e.touches[0].clientX - startX;
      el.scrollLeft = startScroll - dx;
    };
    const onTouchEnd = () => {
      isDown = false;
      setPaused(false);
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endMouse);
    el.addEventListener("mouseleave", endMouse);

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endMouse);
      el.removeEventListener("mouseleave", endMouse);

      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div
      className={`group relative ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 rounded-l-2xl bg-gradient-to-r from-[var(--card)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 rounded-r-2xl bg-gradient-to-l from-[var(--card)] to-transparent" />

      {/* scrolling track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto rounded-2xl border border-[var(--border)] bg-card/60 p-4 select-none cursor-grab [scrollbar-width:none]"
        style={{ scrollBehavior: "auto" }}
        aria-label="Character carousel"
      >
        {items.map((c, i) => (
          <Link key={`${c.slug}-${i}`} href={`/characters/${c.slug}`} className="shrink-0 text-center">
            <div className="rounded-2xl border border-[var(--border)] bg-card">
              {/* IMAGE kept exactly as before */}
              <Image
                src={c.image}
                alt={c.name}
                width={200}
                height={200}
                className="w-[200px] h-[300px] object-cover  rounded-2xl"
              />
            </div>
            <div className="mt-2 text-xs font-medium truncate" title={c.name}>
              {c.name}
            </div>
          </Link>
        ))}
      </div>

      {/* Hide scrollbar in WebKit (non-breaking if unsupported) */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
