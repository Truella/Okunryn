`
# Okunryn

> Private conversations, end-to-end encrypted. Your keys never leave your device.

**Live demo:** https://okunryn.vercel.app  
**Backend:** https://whisperbox.koyeb.app

---

## What is Okunryn?

Okunryn is a real-time encrypted messaging application built for a hackathon. All encryption and decryption happens on the client — the server stores and relays only ciphertext. No one, including the backend, can read your messages.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + CSS variables (glassmorphism)
- **Crypto:** Web Crypto API (native browser — no libraries)
- **Storage:** IndexedDB via `idb` (private key storage)
- **Real-time:** WebSocket (`wss://whisperbox.koyeb.app/ws`)
- **Backend:** WhisperBox API (shared E2EE backend)

---

## Encryption Flow

### On Registration

1. Browser generates an RSA-OAEP 2048-bit key pair locally
2. A random 16-byte PBKDF2 salt and 12-byte AES-GCM IV are generated
3. The user's password is run through PBKDF2 (200,000 iterations, SHA-256) to derive an AES-256-GCM wrapping key
4. The RSA private key is wrapped (encrypted) using the AES-GCM wrapping key
5. The public key (Base64 SPKI), wrapped private key (Base64), and salt (Base64) are sent to the backend — the backend stores these verbatim and never inspects them
6. The wrapped private key, salt, and IV are also stored in IndexedDB on the device

### On Login

1. The backend returns the user's wrapped private key and salt
2. The client loads the IV from IndexedDB
3. PBKDF2 re-derives the same AES-GCM wrapping key from the password and salt
4. The private key is unwrapped back into memory as a `CryptoKey` object
5. The private key exists only in memory for the duration of the session — never serialised

### Sending a Message

1. A one-time AES-256-GCM session key is generated
2. The plaintext is encrypted with the session key
3. The session key is RSA-OAEP encrypted twice:
   - Once with the **recipient's** public key (`encryptedKey`)
   - Once with the **sender's own** public key (`encryptedKeyForSelf`)
4. The payload `{ ciphertext, iv, encryptedKey, encryptedKeyForSelf }` is sent over WebSocket
5. The backend stores and forwards the payload — it sees four Base64 strings

### Receiving a Message

1. The WebSocket delivers the encrypted payload
2. The recipient uses their RSA private key to decrypt `encryptedKey` → session key
3. The session key decrypts the ciphertext → plaintext
4. The message is rendered in the UI

### Reading Sent Messages

Sent messages use `encryptedKeyForSelf` — the sender decrypts this with their own private key to read their own messages from history.

---

## Key Management

| Item | Where it lives | Protected by |
|---|---|---|
| RSA public key | Backend + memory | Public — intentionally shareable |
| RSA private key | Memory only (session) | Never persisted in plaintext |
| Wrapped private key | IndexedDB + backend | AES-256-GCM (password-derived key) |
| PBKDF2 salt | IndexedDB + backend | Not secret — safe to store |
| AES-GCM IV (wrap) | IndexedDB only | Not secret — required for unwrap |
| Session AES key | Memory only | Ephemeral — generated per message |

---

## Security Trade-offs

**Password is the root of trust.** If a user forgets their password, their private key cannot be recovered. There is no password reset. This is by design.

**Device-bound sessions.** The AES-GCM IV used during key wrapping is stored only in IndexedDB on the registration device. Logging in from a new device will fail because the IV is not available. This is a known limitation.

**AES-GCM over AES-KW for wrapping.** AES-KW requires input to be a multiple of 8 bytes. PKCS8-encoded RSA-2048 private keys do not satisfy this constraint. AES-GCM with a stored IV is used instead — it provides equivalent security with authenticated encryption.

**Tokens in sessionStorage.** The refresh token is stored in `sessionStorage` (not `localStorage`) as a pragmatic trade-off. It is cleared when the tab closes. An `httpOnly` cookie would be more secure but requires server-side control we do not have over the backend.

**No forward secrecy.** The same RSA key pair is used for all messages. Compromise of the private key exposes all past messages. True forward secrecy (e.g. ECDH ephemeral keys per message) is out of scope for this version.

---

## Known Limitations

- Login only works on the device used for registration (IV is device-local)
- No password recovery — forgotten passwords mean permanent key loss
- No multi-device support
- No key rotation
- No group messaging
- WebSocket token expires after 15 minutes — auto-refresh is implemented but reconnect adds ~1s latenc- Message history is not paginated in the UI 

---

## Local Development

```b
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open `http://localhost:3000`.

The app connects to the shared WhisperBox backend at `https://whisperbox.koyeb.app`. Any user registered against that backend can be found via search.

---

## Project Structure

```
src/
  app/
    (auth)/          # Login + register pages
    (app)/           # Protected app shell
      inbox/         # Conversation list
      chat/[userId]/ # Message thread
  components/
    auth/            # AuthShell, RegisterForm, LoginForm, illustration
    chat/            # ConversationList, ChatThread, MessageBubble, ComposeBox
    ui/              # Button, Input, Skeleton, ErrorBanner
  context/
    AuthContext.tsx  # Session state + restore on refresh
    SocketContext.tsx # WebSocket — single connection for the session
  crypto/
    utils.ts         # bufferToBase64, base64ToBuffer, generateIV, generateSalt
    keys.ts          # RSA key gen, PBKDF2 derivation, wrap/unwrap
    encrypt.ts       # encryptMessage
    decrypt.ts       # decryptMessage
    storage.ts       # IndexedDB read/write for wrapped key
  hooks/
    useAuth.ts       # register, login, logout
  lib/
    api.ts           # All fetch calls to WhisperBox backend
    session.ts       # In-memory token + CryptoKey state
    errors.ts        # Error classification + user-facing messages
  types/
    index.ts         # Shared TypeScript interfaces
```

---

## Encryption Algorithms Used

| Algorithm | Purpose |
|---|---|
| RSA-OAEP 2048 + SHA-256 | Key exchange (encrypting session keys) |
| AES-256-GCM | Message encryption + private key wrapping |
| PBKDF2 (200,000 iterations, SHA-256) | Password → wrapping key derivation |

All via the native **Web Crypto API** — zero third-party crypto libraries.

---

```
