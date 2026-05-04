import { bufferToBase64, base64ToBuffer } from "./utils";

export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
	return crypto.subtle.generateKey(
		{
			name: "RSA-OAEP",
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: "SHA-256",
		},
		true,
		["encrypt", "decrypt"],
	);
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
	const exported = await crypto.subtle.exportKey("spki", key);
	return bufferToBase64(exported);
}

export async function importPublicKey(base64: string): Promise<CryptoKey> {
	const buffer = base64ToBuffer(base64);
	return crypto.subtle.importKey(
		"spki",
		buffer,
		{ name: "RSA-OAEP", hash: "SHA-256" },
		false,
		["encrypt"],
	);
}


export async function deriveWrappingKey(
	password: string,
	salt: Uint8Array,
): Promise<CryptoKey> {
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveKey"],
	);

	return crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: salt as BufferSource,
			iterations: 200_000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["wrapKey", "unwrapKey"],
	);
}


export async function wrapPrivateKey(
	privateKey: CryptoKey,
	wrappingKey: CryptoKey,
	iv: Uint8Array,
): Promise<ArrayBuffer> {
	return crypto.subtle.wrapKey("pkcs8", privateKey, wrappingKey, {
		name: "AES-GCM",
		iv: iv as BufferSource,
	});
}

export async function unwrapPrivateKey(
	wrappedKey: ArrayBuffer,
	wrappingKey: CryptoKey,
	iv: Uint8Array,
): Promise<CryptoKey> {
	return crypto.subtle.unwrapKey(
		"pkcs8",
		wrappedKey,
		wrappingKey,
		{ name: "AES-GCM", iv: iv as BufferSource },
		{ name: "RSA-OAEP", hash: "SHA-256" },
		false,
		["decrypt"],
	);
}
