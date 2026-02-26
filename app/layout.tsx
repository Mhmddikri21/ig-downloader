import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "ReelGrab — Instagram Reels Downloader",
    description:
        "Download Instagram Reels videos in high quality MP4 format. Free, fast, and no watermark. Just paste the link and download.",
    keywords: ["instagram", "reels", "downloader", "video", "mp4", "free"],
    openGraph: {
        title: "ReelGrab — Instagram Reels Downloader",
        description:
            "Download Instagram Reels videos in high quality MP4. Free & fast.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
