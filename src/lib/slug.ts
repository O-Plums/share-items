import { customAlphabet } from "nanoid";

const slugAlphabet = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
const nanoSlug = customAlphabet(slugAlphabet, 8);

export function generateSlug(): string {
  return nanoSlug();
}
