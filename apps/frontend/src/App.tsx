import { useState, useEffect } from "react";
import { UploadDropzone } from "./components/UploadDropzone";
import { RiskMeter } from "./components/RiskMeter";
import { ClauseList } from "./components/ClauseList";
import { NegotiationPanel } from "./components/NegotiationPanel";
import { LoginModal } from "./components/LoginModal";
import { PricingModal } from "./components/PricingModal";
import type { DocumentAnalysis } from "@legal-guardian/core";
import { User, LogOut, Crown, Shield, Zap } from "lucide-react";

function App() {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [negotiationEmail, setNegotiationEmail] = useState<string | null>(null);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth & Access State
  const [user, setUser] = useState<any>(null);
  const [hasPremium, setHasPremium] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Hydrate user from localStorage AND fetch fresh data
  useEffect(() => {
    // 1. Initial hydration from cache for speed
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 2. Fetch fresh data from backend (Source of Truth)
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:4000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch profile");
        })
        .then((data) => {
          if (data.user) {
            console.log("✅ Profile synced:", data.user);
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        })
        .catch((err) => {
          console.error("Session sync failed:", err);
          // Optional: Logout if 401? For now just keep local state.
        });
    }
  }, []);

  const handleUploadClick = (file: File) => {
    if (!user) {
      setPendingFile(file);
      setIsLoginOpen(true);
      return;
    }

    // Credit Check Logic
    const currentCredits = user.credits || 0;

    if (currentCredits <= 0) {
      setPendingFile(file);
      setIsPricingOpen(true);
      return;
    }

    // Deduct credit (Mock)
    setUser((prev: any) => ({ ...prev, credits: prev.credits - 1 }));
    performAnalysis(file);
  };

  const performAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setNegotiationEmail(null);
    setSelectedClauses([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // In dev, we need to point to the backend port
      const response = await fetch("http://localhost:4000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze document. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleClause = (id: string) => {
    setSelectedClauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleNegotiate = async () => {
    if (!analysis || selectedClauses.length === 0) return;
    // Premium check is already done at entry, but double check
    // Permite gerar o e-mail se o usuário já gastou créditos na análise
    // if (!hasPremium) {
    //   setIsPricingOpen(true);
    //   return;
    // }

    setIsNegotiating(true);
    setNegotiationEmail(null);

    try {
      const response = await fetch("http://localhost:4000/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // We send the full clauses because backend is stateless for this demo
          clauses: analysis.clauses.filter((c) =>
            selectedClauses.includes(c.id),
          ),
        }),
      });

      if (!response.ok) throw new Error("Negotiation failed");

      const data = await response.json();
      setNegotiationEmail(data.body);
    } catch (err) {
      console.error(err);
      setError("Failed to generate negotiation email.");
    } finally {
      setIsNegotiating(false);
    }
  };

  const handleLoginSuccess = (userData: any, token: string) => {
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    // Post-login flow
    if (pendingFile) {
      // After login, see if user has premium (real logic would check backend)
      // For now, we assume they don't, so we show pricing
      setIsPricingOpen(true);
    }
  };

  // Handle GitHub OAuth Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      const handleGithubCallback = async () => {
        try {
          // Clear URL immediately to prevent double-fire
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );

          const response = await fetch("http://localhost:4000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: "github", token: code }),
          });

          const data = await response.json();
          if (response.ok && data.token) {
            handleLoginSuccess(data.user, data.token);
          } else {
            console.error("GitHub Login failed:", data.error);
            setError("GitHub Login failed: " + (data.error || "Unknown"));
          }
        } catch (err) {
          console.error("GitHub Login error:", err);
          setError("GitHub Login failed. See console.");
        }
      };

      handleGithubCallback();
    }
  }, []); // Run once on mount

  // Handle Payment Success Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment_success") === "true") {
      // 1. Clean URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsPricingOpen(false); // Close modal

      const pkgId = params.get("pkg");
      let creditsExpected = 0;
      if (pkgId === "starter") creditsExpected = 1;
      else if (pkgId === "professional") creditsExpected = 5;
      else if (pkgId === "power") creditsExpected = 10;
      else creditsExpected = 5;

      // 2. Poll Backend for updated credits (Webhook latency)
      const token = localStorage.getItem("token");
      if (!token) return;

      let attempts = 0;
      const maxAttempts = 5;

      const pollProfile = async () => {
        try {
          console.log(`🔄 Polling profile... Attempt ${attempts + 1}`);
          const response = await fetch(
            "http://localhost:4000/api/auth/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (response.ok) {
            const data = await response.json();
            const serverCredits = data.user.credits;

            setUser(data.user); // Update valid-of-truth from server
            localStorage.setItem("user", JSON.stringify(data.user));

            // Heuristic: If credits increased, we are good.
            // Or just always update.
            // Ideally we check if it matches what we expect, but for now simple update is enough.

            // If we got the update, stop polling?
            // Hard to know original credits here without ref, but receiving *any* fresh data is better than nothing.
          }
        } catch (e) {
          console.error("Polling error", e);
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(pollProfile, 2000); // Retry every 2s
        } else {
          handleSubscribeSuccess(creditsExpected); // Proceed anyway
        }
      };

      // Start polling
      pollProfile();
    }
  }, []); // Run once on mount

  const handleSubscribeSuccess = (addedCredits = 0) => {
    // If called from manual trigger without params, don't add credits here (handled by callback now)
    // But if called with params (from callback), checks happen below
    setIsPricingOpen(false);

    // If there was a pending file, check if we have enough credits now
    if (pendingFile) {
      performAnalysis(pendingFile);
      setUser((prev: any) => ({ ...prev, credits: (prev?.credits || 0) - 1 }));
      setPendingFile(null);
    }
  };

  /* ... */

  const handleLogout = () => {
    setUser(null);
    setHasPremium(false);
    localStorage.removeItem("token");
    setAnalysis(null);
  };

  return (
    <div className="app-container">
      <header className="layout-header layout-container">
        <h1 className="logo">
          Legal Guardian<span className="dot">.</span>
        </h1>

        <div className="nav-actions">
          {!user ? (
            <button className="btn-login" onClick={() => setIsLoginOpen(true)}>
              <User size={18} />
              <span>Sign In</span>
            </button>
          ) : (
            <div className="user-group">
              {/* Credit Balance Badge */}
              <div
                className="credit-badge"
                onClick={() => setIsPricingOpen(true)}
                title="Click to buy more credits"
              >
                <Zap size={14} className="credit-icon" />
                <span>{user.credits || 0} Credits</span>
                <div className="plus-btn">+</div>
              </div>

              <div className="user-profile">
                <div className="avatar">
                  <img
                    src={user.picture || "https://github.com/shadcn.png"}
                    alt={user.name}
                  />
                </div>
                <span className="user-name">{user.name}</span>
                <LogOut
                  size={18}
                  className="logout-icon"
                  onClick={handleLogout}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="layout-container">
        {!analysis ? (
          <section className="hero-section">
            {/* 3D Product Mockup Background */}
            <div className="product-mockup-container">
              <img
                src="/dashboard-preview.png"
                alt="Legal Guardian AI Analysis Dashboard"
                className="mockup-image"
              />
            </div>

            <div className="pill-label">AI-Powered Legal Assistant</div>
            <h1 className="hero-title">
              Secure Contract <br />
              <span className="highlight-box">Analysis</span>
            </h1>
            <p className="hero-subtitle">
              <strong style={{ color: "#fff", fontWeight: 600 }}>
                Sign with confidence.
              </strong>
              <br />
              Instantly decode complex legalese, spot hidden risks, and
              negotiate better terms with AI-powered precision.
            </p>

            <div className="upload-wrapper">
              <UploadDropzone
                onUpload={handleUploadClick}
                isUploading={isAnalyzing}
              />
            </div>

            {error && <div className="error-banner">{error}</div>}
          </section>
        ) : (
          <div className="dashboard-grid layout-grid">
            <div className="dashboard-sidebar">
              <RiskMeter score={analysis.overallRiskScore} />

              <div className="summary-card card">
                <h3>Summary</h3>
                <p>{analysis.summary}</p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => setAnalysis(null)}
              >
                ← Analyze New Document
              </button>
            </div>

            <div className="dashboard-main">
              <ClauseList
                clauses={analysis.clauses}
                selectedClauses={selectedClauses}
                onToggleClause={toggleClause}
              />
            </div>

            <div className="dashboard-panel">
              <NegotiationPanel
                onGenerate={handleNegotiate}
                emailBody={negotiationEmail}
                isLoading={isNegotiating}
                selectedCount={selectedClauses.length}
              />
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Background */}
      <div className="bg-gradient-1"></div>
      <div className="bg-gradient-2"></div>
      <div className="bg-gradient-3"></div>

      {/* Floating Decor Elements (Only visible on Hero) */}
      {!analysis && (
        <>
          <div className="float-element float-1">
            <Shield size={24} />
            <span>Bank-Grade Security</span>
          </div>
          <div className="float-element float-2">
            <Crown size={24} />
            <span>Premium Analysis</span>
          </div>
        </>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSubscribe={handleSubscribeSuccess}
      />

      <style>{`
        /* Product Mockup Styles - Holographic Floor Effect 🌌 */
        .product-mockup-container {
            position: absolute;
            top: 55%; 
            left: 50%;
            /* Tilted floor perspective */
            transform: translate(-50%, -10%) perspective(1500px) rotateX(25deg) scale(0.9);
            z-index: -1;
            width: 1200px; /* Wide */
            opacity: 0;
            animation: mockupEntrance 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s forwards;
            pointer-events: none;
            
            /* Fade ONLY the bottom edges to blend into void, keep top visible */
            -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 85%);
            mask-image: radial-gradient(circle at center, black 40%, transparent 85%);
        }

        .mockup-image {
            width: 100%;
            border-radius: 16px;
            /* Strong purple/blue glow under the board */
            box-shadow: 0 20px 100px rgba(59, 130, 246, 0.2), 0 0 40px rgba(147, 51, 234, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.08);
            display: block;
        }

        @keyframes mockupEntrance {
            from { 
                opacity: 0; 
                transform: translate(-50%, 20%) perspective(1500px) rotateX(45deg) scale(0.8); 
            }
            to { 
                opacity: 0.5; /* Subtle background presence */
                transform: translate(-50%, -10%) perspective(1500px) rotateX(25deg) scale(0.9); 
            }
        }

        /* ... existing styles ... */

        :root {
          overflow: hidden; /* Kill scroll on body */
        }
        
        body {
            height: 100vh;
            width: 100vw;
            overflow: hidden;
            background: #0f172a; /* Fallback */
        }

        .app-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden; /* Ensure only main scrolls */
        }
        
        /* Make main scrollable while keeping header fixed */
        main.layout-container {
            flex-grow: 1;
            overflow: hidden; /* Fix: Prevent main scroll, handle inside columns */
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .layout-header {
            flex-shrink: 0;
            z-index: 50;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        /* Vibrant Backgrounds */
        .bg-gradient-1 {
            position: fixed;
            top: -10%; left: -10%; width: 60vw; height: 60vw;
            background: radial-gradient(circle, rgba(76, 29, 149, 0.25) 0%, rgba(0,0,0,0) 60%);
            filter: blur(80px); z-index: 0; pointer-events: none;
            animation: float 20s infinite ease-in-out;
        }
        .bg-gradient-2 {
            position: fixed;
            bottom: -20%; right: -10%; width: 70vw; height: 70vw;
            background: radial-gradient(circle, rgba(29, 78, 216, 0.2) 0%, rgba(0,0,0,0) 60%);
            filter: blur(100px); z-index: 0; pointer-events: none;
            animation: float 25s infinite ease-in-out reverse;
        }
        .bg-gradient-3 {
            position: fixed;
            top: 30%; left: 40%; transform: translate(-50%, -50%);
            width: 50vw; height: 50vw;
            background: radial-gradient(circle, rgba(234, 179, 8, 0.08) 0%, rgba(0,0,0,0) 60%);
            filter: blur(90px); z-index: 0; pointer-events: none;
        }

        @keyframes float {
            0% { transform: translate(0, 0); }
            50% { transform: translate(30px, 50px); }
            100% { transform: translate(0, 0); }
        }

        /* Hero Layout - Centered & Compact */
        .hero-section {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            position: relative;
            z-index: 10;
            padding-bottom: 80px; /* Optical center adjustment */
        }
        
        .pill-label {
            display: inline-block;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 8px 20px;
            border-radius: 30px;
            color: var(--color-gold-glow);
            font-size: 0.9rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 32px;
            backdrop-filter: blur(4px);
            box-shadow: 0 0 15px rgba(234, 179, 8, 0.1);
        }

        .highlight-box {
            background: #4ade80; /* Intense Green from reference */
            color: #0f172a;
            padding: 0 16px; 
            border-radius: 12px;
            display: inline-block;
            transform: skew(-3deg);
            box-shadow: 0 0 30px rgba(74, 222, 128, 0.3);
            margin-top: 10px;
        }

        .float-element {
            position: absolute;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 10px 20px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: white;
            font-size: 0.85rem;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 1;
            pointer-events: none;
        }
        
        .float-1 { 
            top: 25%; left: 15%; 
            animation: float-badge 8s infinite ease-in-out; 
            color: #60a5fa; 
        }
        .float-2 { 
            bottom: 25%; right: 15%; 
            animation: float-badge 9s infinite ease-in-out reverse; 
            color: #fbbf24;
        }

        @keyframes float-badge {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }

        .hero-title {
            font-size: 5rem; /* Increased size */
            margin-bottom: var(--space-6);
            line-height: 1.1;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.03em;
        }
        
        .hero-subtitle {
            font-size: 1.35rem; 
            color: var(--color-text-dim);
            margin-bottom: 50px;
            max-width: 650px;
            line-height: 1.6;
            font-weight: 300;
        }

        .upload-wrapper {
            width: 100%;
            max-width: 650px;
            position: relative;
        }
        
        /* Scanner Effect Integration */
        .upload-wrapper::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, var(--color-gold-glow), transparent);
            box-shadow: 0 0 15px var(--color-gold-glow);
            opacity: 0.5;
            animation: scan 4s ease-in-out infinite;
            pointer-events: none;
            z-index: 20;
        }
        
        @keyframes scan {
            0% { top: 10%; opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { top: 90%; opacity: 0; }
        }

        /* Entrance Animations - The Cherry on Top 🍒 */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .pill-label { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
        .hero-title { animation: fadeInUp 0.8s ease-out 0.2s forwards; opacity: 0; }
        .hero-subtitle { animation: fadeInUp 0.8s ease-out 0.4s forwards; opacity: 0; }
        .upload-wrapper { animation: fadeInUp 0.8s ease-out 0.6s forwards; opacity: 0; }

        /* ... existing dashboard and other styles ... */
        .user-group { display: flex; align-items: center; gap: 12px; }
        .premium-badge {
            background: linear-gradient(45deg, var(--color-gold-glow), #d4af37);
            color: #000;
            font-size: 0.7rem; font-weight: 800; padding: 2px 8px;
            border-radius: 4px; display: flex; align-items: center; gap: 4px;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
        }
        .logo {
            font-size: 1.8rem; margin: 0; letter-spacing: -1px; font-weight: 700;
            background: linear-gradient(90deg, #fff, #8892b0);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .dot { color: var(--color-gold-glow); -webkit-text-fill-color: var(--color-gold-glow); text-shadow: 0 0 10px var(--color-gold-glow); }
        .nav-actions { display: flex; align-items: center; }
        .btn-login {
            background: rgba(255, 215, 0, 0.1); color: var(--color-gold-glow);
            border: 1px solid rgba(255, 215, 0, 0.4); padding: 8px 16px;
            border-radius: 20px; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
        }
        .btn-login:hover { background: rgba(255, 215, 0, 0.2); box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); }
        .user-profile {
            display: flex; align-items: center; gap: 10px; background: rgba(255, 255, 255, 0.05);
            padding: 6px 12px; border-radius: 20px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s;
        }
        .user-profile:hover { border-color: rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.1); }
        .user-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
        .user-name { font-size: 0.9rem; color: var(--color-text-bright); }
        .logout-icon { color: var(--color-text-dim); }
        .layout-container { max-width: 1200px; margin: 0 auto; padding: var(--space-6); z-index: 2; position: relative; }
        
        .dashboard-grid { 
            grid-template-columns: 1fr; 
            height: 100%;
            padding-bottom: 20px;
        }
        
        @media (min-width: 1024px) {
            /* Stretch alignment ensures columns fill height */
            .dashboard-grid { 
                grid-template-columns: 300px 1fr 400px; 
                align-items: stretch; 
                gap: 40px; 
            }
        }

        .dashboard-sidebar { 
            display: flex; 
            flex-direction: column; 
            gap: var(--space-8); 
            height: 100%;
            overflow-y: auto; /* Scroll if needed, but stays fixed relative to grid */
            padding-right: 4px;
        }

        .dashboard-main {
            height: 100%;
            overflow-y: auto; /* Independent scrolling for the middle column */
            padding-right: 10px;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.1) rgba(15, 23, 42, 0.5);
        }

        .dashboard-panel {
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden; /* Content handles its own scroll */
        }
        .summary-card { border-left: 3px solid var(--color-gold-glow); }
        .summary-card h3 { color: var(--color-gold-glow); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; }
        .summary-card p { font-size: 1rem; color: var(--color-text-dim); margin: 0; line-height: 1.7; }
        .btn-secondary {
            background: transparent; border: 1px solid rgba(255,255,255,0.1); color: var(--color-text-dim);
            width: 100%; margin-top: var(--space-4); padding: 12px; border-radius: 8px; transition: all 0.2s;
        }
        .btn-secondary:hover { border-color: var(--color-text-bright); color: var(--color-text-bright); }
        .error-banner {
            background: rgba(234, 46, 46, 0.1); border: 1px solid var(--color-danger); color: #ff6b6b;
            padding: var(--space-4); border-radius: var(--radius-lg); margin-top: var(--space-6); backdrop-filter: blur(10px);
        }
      /* Credit Badge Styles */
      .credit-badge {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--color-gold-glow);
        padding: 6px 12px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .credit-badge:hover {
        background: rgba(234, 179, 8, 0.1);
        border-color: var(--color-gold-glow);
        transform: translateY(-1px);
        box-shadow: 0 0 15px rgba(234, 179, 8, 0.1);
      }
      .credit-icon { fill: currentColor; }
      .plus-btn {
        background: var(--color-gold-glow);
        color: black;
        width: 16px; height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 800;
        margin-left: 4px;
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 12px; 
      }

      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid rgba(255,255,255,0.2);
      }
      
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      `}</style>
    </div>
  );
}

export default App;
