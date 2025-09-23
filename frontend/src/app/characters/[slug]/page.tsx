import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacterBySlug } from "@/lib/characters";
import { Button } from "@/components/ui/Button";

type Props = { params: { slug: string } };

export default function CharacterPage({ params }: Props) {
  const character = getCharacterBySlug(params.slug);
  if (!character) return notFound();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold">{character.name}</h1>
        <div className="flex gap-2">
          <Link href={`/chats?character=${encodeURIComponent(character.name)}`}>
            <Button variant="ghost">All chats</Button>
          </Link>
          <Link href={`/chat?character=${encodeURIComponent(character.name)}`}>
            <Button>Chat</Button>
          </Link>
        </div>
      </header>

      <div className="space-y-10">
        {character.sections.map((s, idx) => (
          <section key={idx} className="grid md:grid-cols-2 gap-6 items-center">
            {idx % 2 === 0 ? (
              <>
                <div>
                  {s.title && <h3 className="font-semibold mb-2">{s.title}</h3>}
                  <p className="text-sm text-muted">{s.text}</p>
                </div>
                <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-card">
                  <Image src={s.image || character.image} alt={character.name} width={800} height={600} className="w-full h-64 object-cover" />
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-card order-1 md:order-none">
                  <Image src={s.image || character.image} alt={character.name} width={800} height={600} className="w-full h-64 object-cover" />
                </div>
                <div>
                  {s.title && <h3 className="font-semibold mb-2">{s.title}</h3>}
                  <p className="text-sm text-muted">{s.text}</p>
                </div>
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}


