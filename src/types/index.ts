// API Response Types

export interface UserProfile {
	id: string;
	username: string;
	display_name: string;
	public_key: string;
	wrapped_private_key: string;
	pbkdf2_salt: string;
	created_at: string;
}

export interface AuthResponse {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	user: UserProfile;
}

export interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

export interface UserPublicKey {
	public_key: string;
}

export interface UserPublicInfo {
	id: string;
	username: string;
	display_name: string;
}

export interface ConversationSummary {
	user_id: string;
	display_name: string;
	username: string;
	last_message_at: string;
}

// API Request Types

export interface RegisterRequest {
	username: string;
	display_name: string;
	password: string;
	public_key: string;
	wrapped_private_key: string;
	pbkdf2_salt: string;
}

export interface LoginRequest {
	username: string;
	password: string;
}

//  Message Types

export interface EncryptedMessagePayload {
	ciphertext: string;
	iv: string;
	encryptedKey: string;
	encryptedKeyForSelf: string; 
}

export interface SendMessageRequest {
	to: string;
	payload: EncryptedMessagePayload;
}

export interface MessageResponse {
	id: string;
	from_user_id: string;
	to_user_id: string;
	payload: EncryptedMessagePayload;
	delivered: boolean;
	created_at: string;
}
