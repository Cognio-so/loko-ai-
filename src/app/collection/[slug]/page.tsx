import { notFound } from "next/navigation";
import CollectionChatShell from "./CollectionChatShell";
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

  return <CollectionChatShell slug={assistant.slug} />;
}
