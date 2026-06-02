import { notFound } from "next/navigation";
import UniversalChatInterface from "@/components/UniversalChatInterface";
import { assistants, getAssistant } from "../collection-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return assistants.map((assistant) => ({ slug: assistant.slug }));
}

export default async function CollectionChatPage({ params }: Props) {
  const { slug } = await params;
  const assistant = getAssistant(slug);

  if (!assistant) notFound();

  return <UniversalChatInterface key={assistant.slug} slug={assistant.slug} />;
}
