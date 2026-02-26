import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: "URL tidak boleh kosong." },
                { status: 400 }
            );
        }

        // Normalize the URL
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith("http")) {
            cleanUrl = "https://" + cleanUrl;
        }
        // Remove query params for cleaner fetching
        const urlObj = new URL(cleanUrl);
        const pathname = urlObj.pathname.replace(/\/$/, "");
        const fetchUrl = `https://www.instagram.com${pathname}/`;

        // Fetch the Instagram page with a browser-like User-Agent
        const response = await fetch(fetchUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
            },
            redirect: "follow",
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Gagal mengakses halaman Instagram. Periksa URL Anda." },
                { status: 400 }
            );
        }

        const html = await response.text();

        // Try multiple methods to extract video URL

        // Method 1: og:video meta tag
        let videoUrl = extractMeta(html, 'og:video');

        // Method 2: og:video:secure_url
        if (!videoUrl) {
            videoUrl = extractMeta(html, 'og:video:secure_url');
        }

        // Method 3: Look for video URL in embedded JSON data
        if (!videoUrl) {
            const videoUrlMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/);
            if (videoUrlMatch) {
                videoUrl = videoUrlMatch[1].replace(/\\u0026/g, "&").replace(/\\/g, "");
            }
        }

        // Method 4: Search for .mp4 URL patterns
        if (!videoUrl) {
            const mp4Match = html.match(
                /(https?:\/\/[^\s"']+\.mp4[^\s"']*)/i
            );
            if (mp4Match) {
                videoUrl = mp4Match[1].replace(/\\u0026/g, "&").replace(/\\/g, "");
            }
        }

        // Method 5: Try fetching via Instagram's embed endpoint
        if (!videoUrl) {
            try {
                const embedUrl = `https://www.instagram.com${pathname}/?__a=1&__d=dis`;
                const embedRes = await fetch(embedUrl, {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        Accept: "application/json",
                    },
                });
                if (embedRes.ok) {
                    const text = await embedRes.text();
                    const jsonMatch = text.match(/"video_url"\s*:\s*"([^"]+)"/);
                    if (jsonMatch) {
                        videoUrl = jsonMatch[1].replace(/\\u0026/g, "&").replace(/\\/g, "");
                    }
                }
            } catch {
                // Ignore embed fetch errors
            }
        }

        // Method 6: Try the graphql approach
        if (!videoUrl) {
            try {
                // Extract the shortcode from the URL
                const shortcodeMatch = pathname.match(/\/(reel|reels|p)\/([^/]+)/);
                if (shortcodeMatch) {
                    const shortcode = shortcodeMatch[2];
                    const graphqlUrl = `https://www.instagram.com/graphql/query/?query_hash=b3055c01b4b222b8a47dc12b090e4e64&variables=${encodeURIComponent(
                        JSON.stringify({ shortcode })
                    )}`;
                    const gqlRes = await fetch(graphqlUrl, {
                        headers: {
                            "User-Agent":
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        },
                    });
                    if (gqlRes.ok) {
                        const gqlText = await gqlRes.text();
                        const gqlVideoMatch = gqlText.match(/"video_url"\s*:\s*"([^"]+)"/);
                        if (gqlVideoMatch) {
                            videoUrl = gqlVideoMatch[1]
                                .replace(/\\u0026/g, "&")
                                .replace(/\\/g, "");
                        }
                    }
                }
            } catch {
                // Ignore graphql errors
            }
        }

        if (!videoUrl) {
            return NextResponse.json(
                {
                    error:
                        "Tidak dapat menemukan video. Pastikan URL mengarah ke Instagram Reels yang bisa diakses secara publik.",
                },
                { status: 404 }
            );
        }

        // Extract thumbnail
        let thumbnail = extractMeta(html, 'og:image') || "";

        // Extract caption/title
        let caption = extractMeta(html, 'og:title') ||
            extractMeta(html, 'description') ||
            "";

        return NextResponse.json({
            videoUrl,
            thumbnail,
            caption,
        });
    } catch (error) {
        console.error("Fetch reel error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server. Silakan coba lagi." },
            { status: 500 }
        );
    }
}

function extractMeta(html: string, property: string): string | null {
    // Try property attribute
    const propRegex = new RegExp(
        `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
        'i'
    );
    let match = html.match(propRegex);
    if (match) return match[1];

    // Try reversed attribute order
    const reversedRegex = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
        'i'
    );
    match = html.match(reversedRegex);
    if (match) return match[1];

    // Try name attribute (for description)
    const nameRegex = new RegExp(
        `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
        'i'
    );
    match = html.match(nameRegex);
    if (match) return match[1];

    return null;
}
