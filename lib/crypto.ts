import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Genera un hash seguro de la contraseña usando scrypt.
 * Formato del hash: "salt:derivedKey" (ambos en hex).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifica una contraseña contra su hash.
 * Usa comparación en tiempo constante para evitar timing attacks.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [salt, storedKey] = hash.split(":");
  if (!salt || !storedKey) return false;
  const storedKeyBuffer = Buffer.from(storedKey, "hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(storedKeyBuffer, derivedKey);
}
