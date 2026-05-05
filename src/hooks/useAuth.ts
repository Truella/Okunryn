import { useState } from "react";
import { useRouter } from "next/navigation";
import { triggerAuthSync } from "@/context/AuthContext";
import { apiRegister, apiLogin, apiLogout } from "@/lib/api";
import {
	setSession,
	clearSession,
	getSession,
	getRefreshToken,
} from "@/lib/session";
import {
	generateRSAKeyPair,
	exportPublicKey,
	deriveWrappingKey,
	wrapPrivateKey,
	unwrapPrivateKey,
} from "@/crypto_utils/keys";
import {
	storeWrappedPrivateKey,
	loadWrappedPrivateKey,
} from "@/crypto_utils/storage";
import {
	generateIV,
	generateSalt,
	bufferToBase64,
	base64ToBuffer,
} from "@/crypto_utils/utils";

interface RegisterInput {
	username: string;
	displayName: string;
	password: string;
}

export function useAuth() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function register({ username, displayName, password }: RegisterInput) {
		setLoading(true);
		setError(null);

		try {
			const keyPair = await generateRSAKeyPair();
			const publicKeyBase64 = await exportPublicKey(keyPair.publicKey);

			const salt = generateSalt();
			const wrapIV = generateIV();
			const wrappingKey = await deriveWrappingKey(password, salt);

			const wrappedPrivateKey = await wrapPrivateKey(
				keyPair.privateKey,
				wrappingKey,
				wrapIV,
			);

			const response = await apiRegister({
				username,
				display_name: displayName,
				password,
				public_key: publicKeyBase64,
				wrapped_private_key: bufferToBase64(wrappedPrivateKey),
				pbkdf2_salt: bufferToBase64(salt),
			});

			await storeWrappedPrivateKey(wrappedPrivateKey, salt, wrapIV);

			setSession({
				accessToken: response.access_token,
				refreshToken: response.refresh_token,
				userId: response.user.id,
				username: response.user.username,
				displayName: response.user.display_name,
				publicKey: response.user.public_key,
				privateKey: keyPair.privateKey,
			});

			triggerAuthSync();
			router.push("/inbox");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
		} finally {
			setLoading(false);
		}
	}

	async function login({
		username,
		password,
	}: {
		username: string;
		password: string;
	}) {
		setLoading(true);
		setError(null);

		try {
			const response = await apiLogin({ username, password });
			const user = response.user;

			const stored = await loadWrappedPrivateKey();
			if (!stored) {
				throw new Error(
					"No key found on this device. Please register or use your original device.",
				);
			}

			const serverSalt = new Uint8Array(base64ToBuffer(user.pbkdf2_salt));
			const wrappingKey = await deriveWrappingKey(password, serverSalt);

			const privateKey = await unwrapPrivateKey(
				stored.wrappedKey,
				wrappingKey,
				stored.iv,
			);

			setSession({
				accessToken: response.access_token,
				refreshToken: response.refresh_token,
				userId: user.id,
				username: user.username,
				displayName: user.display_name,
				publicKey: user.public_key,
				privateKey,
			});

			triggerAuthSync();
			router.push("/inbox");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Login failed";
			const isWrongPassword =
				message.toLowerCase().includes("operation") ||
				message.toLowerCase().includes("decrypt");
			setError(isWrongPassword ? "Incorrect password" : message);
		} finally {
			setLoading(false);
		}
	}

	async function logout() {
		const session = getSession();
		const refreshToken = getRefreshToken();
		if (session && refreshToken) {
			await apiLogout(session.accessToken, refreshToken).catch(() => {});
		}
		clearSession();
		router.push("/login");
	}

	return { register, login, logout, loading, error };
}
