/**
 * cn — Merge Tailwind classes safely
 * Lightweight alternative to clsx + tailwind-merge
 * (avoids adding a dependency if not already present)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
