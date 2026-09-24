import { clsx, type ClassValue } from "clsx";
import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AVATAR_COLORS = [
  ['#60a5fa', '#2563eb'],
  ['#f87171', '#dc2626'],
  ['#34d399', '#059669'],
  ['#a78bfa', '#6d28d9'],
  ['#fb7185', '#e11d48'],
  ['#fbbf24', '#d97706'],
  ['#2dd4bf', '#0f766e'],
  ['#f472b6', '#be185d'],
  ['#818cf8', '#4338ca'],
  ['#fb923c', '#c2410c'],
] as const;

export function avatarStyle(seed: string): CSSProperties {
  const value = seed.trim() || 'contact';
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  const pair = AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? AVATAR_COLORS[0];
  return { background: `linear-gradient(145deg, ${pair[0]}, ${pair[1]})`, color: '#fff' };
}
