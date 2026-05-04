import type {
	AuthResponse,
	RegisterRequest,
	LoginRequest,
	TokenResponse,
	UserProfile,
	UserPublicKey,
	UserPublicInfo,
	SendMessageRequest,
	MessageResponse,
	ConversationSummary,
} from "@/types";

const BASE_URL = "https://whisperbox.koyeb.app";

async function request<T>(
	path: string,
	options: RequestInit = {},
	token?: string,
): Promise<T> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json",
		...(options.headers as Record<string, string>),
	};

	if (token) headers["Authorization"] = `Bearer ${token}`;

	const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

	if (!res.ok) {
		const error = await res.json().catch(() => ({ message: "Request failed" }));
		throw new Error(error.detail || error.message || `HTTP ${res.status}`);
	}

	if (res.status === 204) return {} as T;
	return res.json();
}

export async function apiRegister(
	body: RegisterRequest,
): Promise<AuthResponse> {
	return request<AuthResponse>("/auth/register", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export async function apiLogin(body: LoginRequest): Promise<AuthResponse> {
	return request<AuthResponse>("/auth/login", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export async function apiGetMe(token: string): Promise<UserProfile> {
	return request<UserProfile>("/auth/me", {}, token);
}

export async function apiRefreshToken(
	refreshToken: string,
): Promise<TokenResponse> {
	return request<TokenResponse>("/auth/refresh", {
		method: "POST",
		body: JSON.stringify({ refresh_token: refreshToken }),
	});
}

export async function apiLogout(
	token: string,
	refreshToken: string,
): Promise<void> {
	return request<void>(
		"/auth/logout",
		{
			method: "POST",
			body: JSON.stringify({ refresh_token: refreshToken }),
		},
		token,
	);
}

export async function apiSearchUsers(
	query: string,
	token: string,
): Promise<UserPublicInfo[]> {
	return request<UserPublicInfo[]>(
		`/users/search?q=${encodeURIComponent(query)}`,
		{},
		token,
	);
}

export async function apiGetPublicKey(
	userId: string,
	token: string,
): Promise<UserPublicKey> {
	return request<UserPublicKey>(`/users/${userId}/public-key`, {}, token);
}

export async function apiGetConversations(
	token: string,
): Promise<ConversationSummary[]> {
	return request<ConversationSummary[]>("/conversations", {}, token);
}

export async function apiGetConversationHistory(
	userId: string,
	token: string,
	limit = 50,
	before?: string,
): Promise<MessageResponse[]> {
	const params = new URLSearchParams({ limit: String(limit) });
	if (before) params.set("before", before);
	return request<MessageResponse[]>(
		`/conversations/${userId}/messages?${params}`,
		{},
		token,
	);
}

export async function apiSendMessage(
	body: SendMessageRequest,
	token: string,
): Promise<MessageResponse> {
	return request<MessageResponse>(
		"/messages",
		{
			method: "POST",
			body: JSON.stringify(body),
		},
		token,
	);
}
