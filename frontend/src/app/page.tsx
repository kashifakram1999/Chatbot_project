import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* HERO */}
      <header className="relative rounded-2xl border border-[var(--border)] bg-card/70 p-10 shadow-soft text-center">
        <h1 className="text-3xl md:text-4xl font-semibold">Bronn Chat</h1>
        <p className="mt-3 text-base text-muted max-w-2xl mx-auto">
          A character-driven chatbot, styled after Bronn of the Blackwater.
          Practical, witty, and blunt—ready to answer your questions.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/chat">
            <Button className="px-5">Start Chatting</Button>
          </Link>
          <Link href="/chats">
            <Button variant="ghost">All Chats</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
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
