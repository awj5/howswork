import crypto from "crypto";

const algo = "aes-256-gcm";
const ivLength = 12;
const authTagLength = 16;

export function encrypt(text: string) {
  const iv = crypto.randomBytes(ivLength);

  const cipher = crypto.createCipheriv(algo, Buffer.from(process.env.ENCRYPTION_KEY!, "base64"), iv, {
    authTagLength: authTagLength,
  });

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64"); // Combine IV + authTag + encrypted data
}

export function decrypt(encryptedData: string) {
  const data = Buffer.from(encryptedData, "base64");
  const iv = data.subarray(0, ivLength);
  const authTag = data.subarray(ivLength, ivLength + authTagLength);
  const encrypted = data.subarray(ivLength + authTagLength);

  const decipher = crypto.createDecipheriv(algo, Buffer.from(process.env.ENCRYPTION_KEY!, "base64"), iv, {
    authTagLength: authTagLength,
  });

  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final("utf8");
}
