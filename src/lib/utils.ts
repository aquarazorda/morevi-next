import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function removeNumberInParentheses(str: string) {
  return str.replace(/\(?\d+\)?/g, "");
}

export function getReleaseTitle(title: string, artists: { name: string }[]) {
  // we need to replace all "(n)" with empty string in artist name
  return `${artists.map((artist) => removeNumberInParentheses(artist.name)).join(", ")} - ${title}`;
}
