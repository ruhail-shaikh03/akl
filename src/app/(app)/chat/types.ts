export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "memory";
  content: string;
  memoryPhoto?: { blobUrl: string; caption: string | null } | null;
};
