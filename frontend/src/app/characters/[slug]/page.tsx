import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacterBySlug } from "@/lib/characters";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

type CharacterPageProps = { params: Promise<{ slug: string }> };

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { slug } = await params;
  const character = getCharacterBySlug(slug);
  if (!character) return notFound();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
      {/* Left side - Character information */}
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">{character.name}</h1>
        </header>

        <div className="space-y-8">
          {character.sections.map((s, idx) => (
            <section key={idx} className="space-y-4">
              {s.title && <h2 className="text-xl font-semibold">{s.title}</h2>}
              <p className="text-muted leading-relaxed">{s.text}</p>
            </section>
          ))}
        </div>
      </div>

      {/* Right side - Sticky character card */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-center mb-4">
              <Image
                src={character.image}
                alt={character.name}
                width={200}
                height={300}
                className="w-[200px] h-[300px] object-cover rounded-2xl shadow-soft"
              />
            </div>
            <div className="space-y-3 text-center">
              <div className="font-semibold text-lg">{character.name}</div>
              <div className="text-sm text-muted">Converse in-character</div>
              <div className="flex gap-2 justify-center">
                <Link href={`/chat?character=${encodeURIComponent(character.name)}&new=1`}>
                  <Button size="sm">Chat</Button>
                </Link>
                <Link href={`/chats?character=${encodeURIComponent(character.name)}`}>
                  <Button size="sm" variant="ghost">All chats</Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

