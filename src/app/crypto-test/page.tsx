"use client";

import { useEffect, useState } from "react";

export default function CryptoTestPage() {
	const [log, setLog] = useState<string[]>([]);

	function print(msg: string) {
		setLog((prev) => [...prev, msg]);
	}

	useEffect(() => {
		async function run() {
			try {
				const {
					generateRSAKeyPair,
					exportPublicKey,
					importPublicKey,
					deriveWrappingKey,
					wrapPrivateKey,
					unwrapPrivateKey,
				} = await import("@/crypto_utils/keys");
				const { encryptMessage } = await import("@/crypto_utils/encrypt");
				const { decryptMessage } = await import("@/crypto_utils/decrypt");
				const { generateSalt, generateIV } = await import(
					"@/crypto_utils/utils"
				);

				print("1. Generating RSA key pair...");
				const { publicKey, privateKey } = await generateRSAKeyPair();
				print("✅ Key pair generated");

				print("2. Export → import public key...");
				const exported = await exportPublicKey(publicKey);
				const imported = await importPublicKey(exported);
				print("✅ Public key round-tripped");

				print("3. Wrap → unwrap private key...");
				const salt = generateSalt();
				const iv = generateIV();
				const wk1 = await deriveWrappingKey("testpassword123", salt);
				const wrapped = await wrapPrivateKey(privateKey, wk1, iv);
				const wk2 = await deriveWrappingKey("testpassword123", salt);
				const unwrapped = await unwrapPrivateKey(wrapped, wk2, iv);
				print("✅ Private key wrapped and unwrapped");

				print("4. Encrypt → decrypt message...");
				const payload = await encryptMessage(
					"Hello WhisperBox!",
					imported,
					imported,
				);
				const result = await decryptMessage(payload, unwrapped, false);
				print(`✅ Decrypted: "${result}"`);
				if (result !== "Hello WhisperBox!") throw new Error("Mismatch");

				print("5. Wrong password rejection...");
				try {
					const badKey = await deriveWrappingKey("wrongpassword", salt);
					await unwrapPrivateKey(wrapped, badKey, iv);
					print("❌ Should have thrown");
				} catch {
					print("✅ Wrong password correctly rejected");
				}

				print("\n🎉 All tests passed");
			} catch (err) {
				print(`❌ FAILED: ${err}`);
			}
		}

		run();
	}, []);

	return (
		<div className="min-h-screen bg-[#0a0a0a] p-8 font-mono">
			<h1 className="text-[#22c55e] text-lg mb-6">Crypto Test</h1>
			<div className="flex flex-col gap-2">
				{log.map((line, i) => (
					<p
						key={i}
						className={
							line.startsWith("❌")
								? "text-[#ef4444]"
								: line.startsWith("✅") || line.startsWith("🎉")
									? "text-[#22c55e]"
									: "text-[#a3a3a3]"
						}
					>
						{line}
					</p>
				))}
			</div>
		</div>
	);
}
