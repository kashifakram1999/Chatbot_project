import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className="space-y-5">
        <h1 className="font-heading text-4xl sm:text-5xl">
          Speak with characters from the world of{" "}
          <span className="text-wtr-gold">Ice and Fire</span>.
        </h1>
        <p className="text-muted">
          Live, in-character conversations powered by retrieval and careful
          prompt craft. Switch to narrator mode with{" "}
          <code className="badge">[[OOC]]</code>.
        </p>
        <div className="flex gap-3">
          <Link href="/chat" className="btn-primary">
            Enter the hall
          </Link>
          <Link href="/register" className="btn-ghost">
            Join the realm
          </Link>
        </div>
      </div>

      <div className="card-wtr overflow-hidden">
        <Image
          src="/hero-placeholder.jpg"
          alt="Westeros themed hero"
          width={1200}
          height={800}
          className="w-full h-[320px] object-cover"
        />
      </div>
    </section>
  );
}
