export type CharacterInfo = {
  slug: string;
  name: string;
  image: string;
  sections: Array<{ title?: string; text: string; image?: string }>;
};

export const CHARACTERS: CharacterInfo[] = [
  {
    slug: "bronn",
    name: "Bronn",
    image: "/images/Bronn.jpeg",
    sections: [
      { title: "Origins", text: "A hardened sellsword of uncertain birth, Bronn rises by taking calculated risks and backing the winning side.", image: "/images/Got-Cover.jpeg" },
      { title: "Allies", text: "His most famous partnership is with Tyrion Lannister, forged after trial by combat in the Vale and sustained by mutual benefit.", image: "/images/Got-Cover.jpeg" },
      { title: "Reputation", text: "Cynical, quick with a barb, and deadly with a blade, he keeps his promises—so long as the coin is right.", image: "/images/Got-Cover.jpeg" },
    ],
  },
  { slug: "tyrion-lannister", name: "Tyrion Lannister", image: "/images/tyrion lannister.jpg", sections: [
    { title: "Wit and Learning", text: "Youngest Lannister, derided as the Imp, he leans on books and strategy where others trust steel.", image: "/images/Got-Cover.jpeg" },
    { title: "Court Intrigue", text: "Survives courts and sieges alike through negotiation, leverage, and a keen eye for motives.", image: "/images/Got-Cover.jpeg" },
    { title: "Complicated Ties", text: "Bound to family and spurned by it, Tyrion’s loyalties are pragmatic and personal rather than blind.", image: "/images/Got-Cover.jpeg" },
  ] },
  { slug: "arya-stark", name: "Arya Stark", image: "/images/arya stark.jpg", sections: [
    { title: "Wolf-Blood", text: "Youngest Stark daughter with a fierce, untamed streak and a talent for the blade.", image: "/images/Got-Cover.jpeg" },
    { title: "Survival", text: "Endures war and exile by learning to move unseen, remembering names, and never forgetting home.", image: "/images/Got-Cover.jpeg" },
    { title: "Becoming No One", text: "Trains to shed identity—yet finds her true self anchored to family and Northern vows.", image: "/images/Got-Cover.jpeg" },
  ] },
  { slug: "daenerys-targaryen", name: "Daenerys Targaryen", image: "/images/Daenerys.jpeg", sections: [
    { title: "Exile to Empress", text: "Last scion of a fallen house, she grows from pawn to ruler across the Narrow Sea.", image: "/images/Got-Cover.jpeg" },
    { title: "Breaker of Chains", text: "Her rule is defined by freeing the enslaved and wrestling with what justice demands.", image: "/images/Got-Cover.jpeg" },
    { title: "Mother of Dragons", text: "Her dragons are power, symbol, and burden—the fire that forges and threatens.", image: "/images/Got-Cover.jpeg" },
  ] },
  { slug: "jon-snow", name: "Jon Snow", image: "/images/jon snow.jpeg", sections: [
    { title: "The Watch", text: "Takes the black and finds purpose at the edge of the world among the Night’s Watch.", image: "/images/Got-Cover.jpeg" },
    { title: "Duty and Mercy", text: "Struggles to balance oaths with compassion, making hard choices for the living.", image: "/images/Got-Cover.jpeg" },
    { title: "Between Worlds", text: "Mediator between Free Folk and the Watch, he challenges old hatreds for a larger fight.", image: "/images/Got-Cover.jpeg" },
  ] },
  { slug: "cersei-lannister", name: "Cersei Lannister", image: "/images/cersei.jpeg", sections: [
    { title: "Lioness of the Rock", text: "Queen and Lannister scion, her love for her children defines—and distorts—her rule.", image: "/images/Got-Cover.jpeg" },
    { title: "Power and Paranoia", text: "Seeks absolute control, seeing enemies in every shadow and slight.", image: "/images/Got-Cover.jpeg" },
    { title: "Cost of Crowns", text: "Her gambits reshape King’s Landing, winning battles while sowing future ruin.", image: "/images/Got-Cover.jpeg" },
  ] },
];

export function getCharacterBySlug(slug: string): CharacterInfo | undefined {
  return CHARACTERS.find((c) => c.slug === slug);
}

