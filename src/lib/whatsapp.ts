import "server-only";

/** Builds a wa.me deep link server-side so the number itself never reaches client JS. */
export function getWhatsAppLink(message: string): string | null {
  const number = process.env.ADMIN_WHATSAPP_NUMBER;
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
