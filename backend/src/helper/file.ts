import fs from "node:fs";
import { MAX_DB_VARCHAR_LENGTH } from "../config/upload.js";

// deletes a file, a file that is already gone is not an error
export const removeFile = (filePath: string) =>
  fs.promises.unlink(filePath).catch(() => {});

// the mimetype comes from the client, so also check the real file signature
export const hasPdfSignature = async (filePath: string) => {
  const handle = await fs.promises.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(5);
    await handle.read(buffer, 0, 5, 0);
    return buffer.toString("latin1") === "%PDF-";
  } finally {
    await handle.close();
  }
};

// multer decodes the filename as latin1, this restores the real utf-8 name
export const getOriginalFileName = (name: string) => {
  const decoded = Buffer.from(name, "latin1").toString("utf8");
  if (decoded.length <= MAX_DB_VARCHAR_LENGTH) return decoded;
  return `${decoded.slice(0, MAX_DB_VARCHAR_LENGTH - ".pdf".length)}.pdf`;
};
