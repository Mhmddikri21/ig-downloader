"use client";

import { useState } from "react";

interface VideoPreviewProps {
    data: {
        videoUrl: string;
        thumbnail: string;
        caption: string;
    };
}

export default function VideoPreview({ data }: VideoPreviewProps) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const res = await fetch(
                `/api/download?url=${encodeURIComponent(data.videoUrl)}`
            );

            if (!res.ok) {
                throw new Error("Download gagal");
            }

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `reelgrab_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download error:", err);
            alert("Gagal mendownload video. Silakan coba lagi.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="result-card">
            <div className="video-container">
                <video
                    src={`/api/download?url=${encodeURIComponent(data.videoUrl)}`}
                    poster={data.thumbnail}
                    controls
                    playsInline
                    preload="metadata"
                />
            </div>
            <div className="result-info">
                {data.caption && <p className="result-caption">{data.caption}</p>}
                <button
                    id="download-btn"
                    className="download-btn"
                    onClick={handleDownload}
                    disabled={downloading}
                >
                    {downloading ? (
                        <>
                            <span className="spinner" /> Downloading...
                        </>
                    ) : (
                        "⬇️ Download MP4"
                    )}
                </button>
            </div>
        </div>
    );
}
