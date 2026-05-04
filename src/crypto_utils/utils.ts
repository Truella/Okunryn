type Bytes = ArrayBuffer | ArrayBufferView;

function toUint8Array(bytes: Bytes): Uint8Array {
	if (bytes instanceof Uint8Array) return bytes;
	if (bytes instanceof ArrayBuffer) return new Uint8Array(bytes);
	return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function uint8ToString(arr: Uint8Array): string {
	let result = "";
	const chunkSize = 0x8000;
	for (let i = 0; i < arr.length; i += chunkSize) {
		result += String.fromCharCode(...arr.subarray(i, i + chunkSize));
	}
	return result;
}

export function bufferToBase64(bytes: Bytes): string {
	return btoa(uint8ToString(toUint8Array(bytes)));
}

export function base64ToBuffer(base64: string): ArrayBuffer {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer as ArrayBuffer;
}

export function generateIV(): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(12));
}

export function generateSalt(): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(16));
}
