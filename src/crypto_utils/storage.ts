import { openDB, type IDBPDatabase } from "idb";
import { bufferToBase64, base64ToBuffer } from "./utils";

interface StoredKeyRecord {
	wrappedKey: string; // Base64
	salt: string; // Base64
	iv: string; // Base64
}

const DB_NAME = "whisperbox-keys";
const STORE_NAME = "keys";
const KEY_RECORD_ID = "privateKey";

async function getDB(): Promise<IDBPDatabase> {
	return openDB(DB_NAME, 1, {
		upgrade(db) {
			db.createObjectStore(STORE_NAME);
		},
	});
}

export async function storeWrappedPrivateKey(
	wrappedKey: ArrayBuffer,
	salt: Uint8Array,
	iv: Uint8Array,
): Promise<void> {
	const db = await getDB();
	await db.put(
		STORE_NAME,
		{
			wrappedKey: bufferToBase64(wrappedKey),
			salt: bufferToBase64(salt),
			iv: bufferToBase64(iv),
		},
		KEY_RECORD_ID,
	);
}

export async function loadWrappedPrivateKey(): Promise<{
	wrappedKey: ArrayBuffer;
	salt: Uint8Array;
	iv: Uint8Array;
} | null> {
	const db = await getDB();
	const record: StoredKeyRecord | undefined = await db.get(
		STORE_NAME,
		KEY_RECORD_ID,
	);
	if (!record) return null;

	return {
		wrappedKey: base64ToBuffer(record.wrappedKey),
		salt: new Uint8Array(base64ToBuffer(record.salt)),
		iv: new Uint8Array(base64ToBuffer(record.iv)),
	};
}

export async function clearStoredKeys(): Promise<void> {
	const db = await getDB();
	await db.clear(STORE_NAME);
}

export async function hasStoredPrivateKey(): Promise<boolean> {
	const db = await getDB();
	const record = await db.get(STORE_NAME, KEY_RECORD_ID);
	return !!record;
}
