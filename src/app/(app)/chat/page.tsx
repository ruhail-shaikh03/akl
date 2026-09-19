import { getOrCreateActiveConversation, getConversationMessages } from "./actions";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { ChatClient } from "./ChatClient";
import type { ChatMessage } from "./types";

export default async function ChatPage() {
  const conversation = await getOrCreateActiveConversation();
  const messages = await getConversationMessages(conversation.id);
  const waLink = getWhatsAppLink("Hey, I need you 💛");

  const initialMessages: ChatMessage[] = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }));

  return <ChatClient conversationId={conversation.id} initialMessages={initialMessages} waLink={waLink} />;
}
