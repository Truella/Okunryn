import { base64ToBuffer } from "./utils";
import type { EncryptedMessagePayload } from "@/types";

export async function decryptMessage(
	payload: EncryptedMessagePayload,
	privateKey: CryptoKey,
	isSender = false,
): Promise<string> {
	const keyToDecrypt = isSender
		? payload.encryptedKeyForSelf
		: payload.encryptedKey;

	//  Recover the session key using RSA private key
	const sessionKeyRaw = await crypto.subtle.decrypt(
		{ name: "RSA-OAEP" },
		privateKey,
		base64ToBuffer(keyToDecrypt),
	);

	// Import raw bytes as a usable CryptoKey
	const sessionKey = await crypto.subtle.importKey(
		"raw",
		sessionKeyRaw,
		{ name: "AES-GCM" },
		false,
		["decrypt"],
	);

	//  Decrypt the message content
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: base64ToBuffer(payload.iv) },
		sessionKey,
		base64ToBuffer(payload.ciphertext),
	);

	return new TextDecoder().decode(decrypted);
}
