import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const videoUrl = searchParams.get("url");

        if (!videoUrl) {
            return NextResponse.json(
                { error: "Parameter URL diperlukan." },
                { status: 400 }
            );
        }

        // Fetch the video from Instagram CDN
        const response = await fetch(videoUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Referer: "https://www.instagram.com/",
                Origin: "https://www.instagram.com",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Gagal mendownload video." },
                { status: response.status }
            );
        }

        const contentType =
            response.headers.get("content-type") || "video/mp4";
        const contentLength = response.headers.get("content-length");

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        headers.set(
            "Content-Disposition",
            `attachment; filename="reelgrab_${Date.now()}.mp4"`
        );
        if (contentLength) {
            headers.set("Content-Length", contentLength);
        }
        headers.set("Cache-Control", "public, max-age=3600");

        // Stream the response body
        return new NextResponse(response.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat mendownload." },
            { status: 500 }
        );
    }
}
