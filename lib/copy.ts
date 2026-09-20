import type { SiteContent } from "./types";

export function interpolate(
  template: string,
  site: Pick<SiteContent, "name" | "role" | "location" | "email">,
) {
  return template
    .replaceAll("{name}", site.name)
    .replaceAll("{role}", site.role)
    .replaceAll("{location}", site.location)
    .replaceAll("{email}", site.email);
}

export function navHref(site: SiteContent, id: string, fallback: string) {
  return site.navigation.find((item) => item.id === id)?.href || fallback;
}

export function whatsappDigits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function whatsappHref(phone: string, message = "") {
  const digits = whatsappDigits(phone);
  if (!digits) return "";
  const text = message.trim();
  return text
    ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${digits}`;
}
