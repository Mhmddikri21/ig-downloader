import DownloadForm from "./components/DownloadForm";

export default function Home() {
    return (
        <>
            <div className="bg-gradient" />
            <div className="grid-pattern" />

            <main className="main-container">
                {/* Hero Section */}
                <section className="hero">
                    <div className="hero-badge">
                        <span className="dot" />
                        Free &amp; Unlimited
                    </div>
                    <h1>
                        Download{" "}
                        <span className="gradient-text">Instagram Reels</span>{" "}
                        Instantly
                    </h1>
                    <p>
                        Paste any Instagram Reels URL and download the video in high quality
                        MP4 format. No login, no watermark, completely free.
                    </p>
                </section>

                {/* Download Form */}
                <DownloadForm />

                {/* Features */}
                <div className="features">
                    <div className="feature-item">
                        <span className="feature-icon">⚡</span>
                        <span>Lightning Fast</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🎬</span>
                        <span>HD Quality</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">🔒</span>
                        <span>100% Private</span>
                    </div>
                </div>

                {/* Footer */}
                <footer className="footer">
                    <p>
                        Built with ❤️ — ReelGrab is not affiliated with Instagram or Meta.
                    </p>
                </footer>
            </main>
        </>
    );
}
