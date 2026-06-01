import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 18;
const HANDLE_JOINERS = ["the", "official", "real", "ai", "dev", "hq", "app"];

function titleCaseName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function extractNameCandidate(value: unknown) {
  if (typeof value !== "string") return "";

  const withoutEmailDomain = value.split("@")[0] ?? "";
  const readableParts = withoutEmailDomain
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s._\-+]+/)
    .map((part) => part.replace(/[^a-zA-Z]/g, "").trim())
    .filter(Boolean);

  for (const part of readableParts) {
    const lowerPart = part.toLowerCase();
    const joinedPrefix = HANDLE_JOINERS
      .map((joiner) => lowerPart.indexOf(joiner))
      .filter((index) => index >= MIN_NAME_LENGTH)
      .sort((a, b) => a - b)[0];

    const candidate = typeof joinedPrefix === "number" ? lowerPart.slice(0, joinedPrefix) : lowerPart;
    if (candidate.length >= MIN_NAME_LENGTH && candidate.length <= MAX_NAME_LENGTH) {
      return titleCaseName(candidate);
    }
  }

  return "";
}

export function formatDisplayName(...values: unknown[]) {
  for (const value of values) {
    const candidate = extractNameCandidate(value);
    if (candidate) return candidate;
  }

  return "Friend";
}
