import { generateIV, bufferToBase64 } from "./utils";
import type { EncryptedMessagePayload } from "@/types";

export async function encryptMessage(
	plaintext: string,
	recipientPublicKey: CryptoKey,
	senderPublicKey: CryptoKey,
): Promise<EncryptedMessagePayload> {
	// One-time AES-GCM session key — never reused
	const sessionKey = await crypto.subtle.generateKey(
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt"],
	);

	// Encrypt the message
	const iv = generateIV();
	const ciphertext = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv : iv as BufferSource },
		sessionKey,
		new TextEncoder().encode(plaintext),
	);

	// Export raw session key for RSA wrapping
	const rawSessionKey = await crypto.subtle.exportKey("raw", sessionKey);

	// Encrypt session key for recipient
	const encryptedKey = await crypto.subtle.encrypt(
		{ name: "RSA-OAEP" },
		recipientPublicKey,
		rawSessionKey,
	);

	// Encrypt session key for self (to read own sent messages)
	const encryptedKeyForSelf = await crypto.subtle.encrypt(
		{ name: "RSA-OAEP" },
		senderPublicKey,
		rawSessionKey,
	);

	return {
		ciphertext: bufferToBase64(ciphertext),
		iv: bufferToBase64(iv),
		encryptedKey: bufferToBase64(encryptedKey),
		encryptedKeyForSelf: bufferToBase64(encryptedKeyForSelf),
	};
}
