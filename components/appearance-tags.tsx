import {
  appearanceFontLinks,
  appearanceStylesheet,
  sanitizeAppearance,
} from "@/lib/appearance";
import type { AppearanceSettings } from "@/lib/types";

export function AppearanceTags({ appearance }: { appearance: AppearanceSettings }) {
  const safe = sanitizeAppearance(appearance);
  return (
    <>
      {appearanceFontLinks(safe).map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <style
        id="site-appearance"
        dangerouslySetInnerHTML={{ __html: appearanceStylesheet(safe) }}
      />
    </>
  );
}
