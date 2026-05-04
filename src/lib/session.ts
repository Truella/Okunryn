interface Session {
	accessToken: string;
	refreshToken: string;
	userId: string;
	username: string;
	displayName: string;
	publicKey: string;
	privateKey: CryptoKey;
}

let _session: Session | null = null;

const STORAGE_KEY = "wb_refresh";

export function setSession(session: Session): void {
	_session = session;
	sessionStorage.setItem(STORAGE_KEY, session.refreshToken);
}

export function getSession(): Session | null {
	return _session;
}

export function getAccessToken(): string | null {
	return _session?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
	return sessionStorage.getItem(STORAGE_KEY);
}

export function clearSession(): void {
	_session = null;
	sessionStorage.removeItem(STORAGE_KEY);
}

export function isAuthenticated(): boolean {
	return _session !== null;
}

export function updateAccessToken(newToken: string): void {
	if (_session) _session.accessToken = newToken;
}
