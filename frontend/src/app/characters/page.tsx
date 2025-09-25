import Link from "next/link";
import Image from "next/image";
import { CHARACTERS } from "@/lib/characters";
import { Card, CardBody } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import RequireAuth from "@/components/auth/RequireAuth";

export default function CharactersIndexPage() {
  return (
    <RequireAuth>
      <Section title="Choose a character">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CHARACTERS.map((c) => (
            <Card key={c.slug}>
              <CardBody className="p-5">
                <div className="flex items-center justify-center">
                  <Image
                    src={c.image}
                    alt={c.name}
                    width={200}
                    height={300}
                    className="w-[200px] h-[300px] object-cover rounded-2xl shadow-soft"
                  />
                </div>
                <div className="mt-4 space-y-2 text-center">
                  <div className="font-semibold text-base">{c.name}</div>
                  <div className="text-sm text-muted">Converse in-character</div>
                  <div className="flex gap-2 justify-center pt-1">
                    <Link href={`/chat?character=${encodeURIComponent(c.name)}&new=1`}>
                      <Button size="sm">Chat</Button>
                    </Link>
                    <Link href={`/chats?character=${encodeURIComponent(c.name)}`}>
                      <Button size="sm" variant="ghost">All chats</Button>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>
    </RequireAuth>
  );
}


