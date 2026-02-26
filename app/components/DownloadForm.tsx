"use client";

import { useState, FormEvent } from "react";
import VideoPreview from "./VideoPreview";

interface ReelData {
    videoUrl: string;
    thumbnail: string;
    caption: string;
}

export default function DownloadForm() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reelData, setReelData] = useState<ReelData | null>(null);

    const isValidUrl = (input: string) => {
        return /instagram\.com\/(reel|reels|p)\//.test(input);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setUrl(text);
            setError("");
        } catch {
            setError("Tidak bisa mengakses clipboard. Silakan paste secara manual.");
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setReelData(null);

        if (!url.trim()) {
            setError("Silakan masukkan URL Instagram Reels.");
            return;
        }

        if (!isValidUrl(url.trim())) {
            setError(
                "URL tidak valid. Pastikan URL berasal dari Instagram Reels (contoh: https://www.instagram.com/reel/...)"
            );
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/fetch-reel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal mengambil data reel.");
            }

            setReelData(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="download-card">
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <div className="url-input-wrapper">
                            <span className="input-icon">🔗</span>
                            <input
                                id="url-input"
                                type="text"
                                className="url-input"
                                placeholder="Paste Instagram Reels URL here..."
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    setError("");
                                }}
                                disabled={loading}
                                autoComplete="off"
                            />
                        </div>
                        <button
                            type="button"
                            className="paste-btn"
                            onClick={handlePaste}
                            disabled={loading}
                        >
                            📋 Paste
                        </button>
                    </div>

                    <button
                        id="submit-btn"
                        type="submit"
                        className="submit-btn"
                        disabled={loading || !url.trim()}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" /> Mengambil video...
                            </>
                        ) : (
                            "🚀 Download Reel"
                        )}
                    </button>
                </form>

                {error && (
                    <div className="error-message" role="alert">
                        ⚠️ {error}
                    </div>
                )}
            </div>

            {reelData && <VideoPreview data={reelData} />}
        </>
    );
}
