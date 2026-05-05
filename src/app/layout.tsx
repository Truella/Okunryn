import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Okunryn",
	description:
		"Private conversations, end-to-end encrypted. Only you can read your messages.",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
		>
			<body
				className="min-h-full flex flex-col"
				style={{ backgroundColor: "var(--bg)", color: "var(--text-primary)" }}
			>
				{children}
			</body>
		</html>
	);
}
