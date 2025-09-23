import Link from "next/link";
import Image from "next/image";
import { CHARACTERS } from "@/lib/characters";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import Hero from "@/components/Hero";

export default function HomePage() {
  const characters = CHARACTERS;
  return (
    <div className="space-y-16">
      {/* HERO */}
      <Hero />
      <header className="relative rounded-2xl border border-[var(--border)] bg-card/70 p-10 shadow-soft text-center">
        <h1 className="text-3xl md:text-4xl font-semibold">All Characters</h1>
        

        {/* Characters grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {characters.map((c) => (
            <Link key={c.slug} href={`/characters/${c.slug}`} className="text-center">
              <div className="rounded-2xl border border-[var(--border)] bg-card">
                <Image
                  src={c.image}
                  alt={c.name}
                  width={200}
                  height={160}
                  className="w-full h-60 object-cover  rounded-2xl"
                />
              </div>
              <div className="mt-2 text-xs font-medium truncate" title={c.name}>{c.name}</div>
            </Link>
          ))}
        </div>
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
