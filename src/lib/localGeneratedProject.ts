export interface LocalGeneratedFile {
  path: string;
  content: string;
}

function toTitleFromPrompt(prompt: string) {
  const cleaned = prompt
    .replace(/build mode:\s*(app|landing|dashboard)\.?/gi, "")
    .replace(/create a|make a|build a|website|web app|landing page|absolutely stunning/gi, " ")
    .replace(/[^a-z0-9\s-_]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Premium Landing Page";

  return cleaned
    .split(" ")
    .slice(0, 4)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getLocalGeneratedProject(userPrompt: string) {
  const projectTitle = toTitleFromPrompt(userPrompt);
  const description =
    userPrompt
      .replace(/build mode:\s*(app|landing|dashboard)\.?/gi, "")
      .replace(/\s+/g, " ")
      .trim() || "A modern, conversion-optimized landing page.";

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${projectTitle}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #020617;
      --surface: #0f172a;
      --surface2: #1e293b;
      --primary: #6366f1;
      --primary-light: #818cf8;
      --accent: #a5b4fc;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --border: rgba(255,255,255,0.08);
      --radius: 16px;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      overflow-x: hidden;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }

    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    /* NAV */
    nav {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 6vw;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
    }

    .nav-brand {
      font-size: 20px; font-weight: 900; letter-spacing: -0.03em;
      background: linear-gradient(135deg, #818cf8, #a5b4fc);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .nav-links {
      display: flex; gap: 28px; list-style: none;
    }

    .nav-links a {
      color: var(--text-muted); text-decoration: none; font-size: 14px; font-weight: 500;
      transition: color 0.2s;
    }

    .nav-links a:hover { color: var(--text); }

    .nav-cta {
      background: var(--primary); color: white; border: none; border-radius: 9999px;
      padding: 10px 22px; font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 0 24px rgba(99,102,241,0.4);
      transition: all 0.2s; text-decoration: none;
    }

    .nav-cta:hover { background: #818cf8; transform: translateY(-1px); box-shadow: 0 0 32px rgba(99,102,241,0.6); }

    /* HERO */
    .hero {
      min-height: 90vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: 80px 6vw 60px;
      position: relative; overflow: hidden;
    }

    .hero-bg {
      position: absolute; inset: 0; z-index: 0;
      background: radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.15) 0%, transparent 50%),
                  radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 50%),
                  radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.08) 0%, transparent 60%);
    }

    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25);
      border-radius: 9999px; padding: 8px 16px; margin-bottom: 24px;
      font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em;
      animation: fadeInUp 0.6s ease both;
    }

    .hero-badge::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%; background: #10b981;
      animation: float 2s ease-in-out infinite;
    }

    h1 {
      font-size: clamp(42px, 8vw, 88px); font-weight: 900; line-height: 1.0;
      letter-spacing: -0.05em; margin-bottom: 20px; position: relative; z-index: 1;
      animation: fadeInUp 0.6s 0.1s ease both;
    }

    .gradient-text {
      background: linear-gradient(135deg, #818cf8, #a5b4fc, #c7d2fe, #818cf8);
      background-size: 300%;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      animation: gradientShift 4s ease infinite;
    }

    .hero-sub {
      font-size: clamp(16px, 2.5vw, 20px); color: var(--text-muted); max-width: 600px;
      margin: 0 auto 36px; line-height: 1.7; position: relative; z-index: 1;
      animation: fadeInUp 0.6s 0.2s ease both;
    }

    .hero-actions {
      display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;
      position: relative; z-index: 1;
      animation: fadeInUp 0.6s 0.3s ease both;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #7c3aed);
      color: white; border: none; border-radius: 9999px;
      padding: 14px 32px; font-size: 16px; font-weight: 700; cursor: pointer;
      box-shadow: 0 8px 32px rgba(99,102,241,0.35);
      transition: all 0.2s; text-decoration: none; display: inline-block;
    }

    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(99,102,241,0.5); }

    .btn-secondary {
      background: rgba(255,255,255,0.06); border: 1px solid var(--border);
      color: var(--text); border-radius: 9999px;
      padding: 14px 32px; font-size: 16px; font-weight: 600; cursor: pointer;
      backdrop-filter: blur(8px); transition: all 0.2s; text-decoration: none; display: inline-block;
    }

    .btn-secondary:hover { background: rgba(255,255,255,0.10); border-color: rgba(99,102,241,0.3); }

    /* STATS */
    .stats-bar {
      display: flex; justify-content: center; gap: 4px; flex-wrap: wrap;
      padding: 20px 6vw 60px;
    }

    .stat-card {
      background: rgba(255,255,255,0.03); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px 32px; text-align: center;
      backdrop-filter: blur(12px); min-width: 140px;
    }

    .stat-value {
      font-size: 36px; font-weight: 900; letter-spacing: -0.04em;
      background: linear-gradient(135deg, var(--accent), white);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .stat-label { font-size: 13px; color: var(--text-muted); margin-top: 4px; font-weight: 500; }

    /* SECTIONS */
    section {
      padding: 80px 6vw;
      animation: fadeInUp 0.6s ease both;
    }

    .section-label {
      display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--primary-light); margin-bottom: 12px;
    }

    h2 {
      font-size: clamp(28px, 5vw, 48px); font-weight: 900; line-height: 1.1;
      letter-spacing: -0.04em; margin-bottom: 16px;
    }

    .section-sub {
      color: var(--text-muted); font-size: 17px; max-width: 560px; line-height: 1.7;
    }

    /* FEATURES */
    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px; margin-top: 48px;
    }

    .feature-card {
      background: rgba(255,255,255,0.03); border: 1px solid var(--border);
      border-radius: 20px; padding: 28px;
      transition: all 0.3s; cursor: default;
    }

    .feature-card:hover {
      background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.2);
      transform: translateY(-4px);
    }

    .feature-icon {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
      border: 1px solid rgba(99,102,241,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; margin-bottom: 16px;
    }

    .feature-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
    .feature-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

    /* TESTIMONIALS */
    .testimonials-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px; margin-top: 48px;
    }

    .testimonial-card {
      background: rgba(255,255,255,0.03); border: 1px solid var(--border);
      border-radius: 20px; padding: 24px;
    }

    .testimonial-stars { font-size: 14px; margin-bottom: 12px; color: #fbbf24; }
    .testimonial-text { font-size: 15px; color: var(--text-muted); line-height: 1.7; margin-bottom: 20px; font-style: italic; }

    .testimonial-author { display: flex; align-items: center; gap: 12px; }

    .testimonial-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), #7c3aed);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; flex-shrink: 0;
    }

    .testimonial-name { font-size: 14px; font-weight: 700; }
    .testimonial-role { font-size: 12px; color: var(--text-muted); }

    /* PRICING */
    .pricing-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px; margin-top: 48px; max-width: 880px; margin-left: auto; margin-right: auto;
    }

    .pricing-card {
      background: rgba(255,255,255,0.03); border: 1px solid var(--border);
      border-radius: 20px; padding: 28px; position: relative;
    }

    .pricing-card.popular {
      border-color: var(--primary); background: rgba(99,102,241,0.06);
      box-shadow: 0 0 40px rgba(99,102,241,0.15);
    }

    .popular-badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: var(--primary); color: white; font-size: 10px; font-weight: 800;
      letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px;
    }

    .pricing-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .pricing-price { font-size: 42px; font-weight: 900; letter-spacing: -0.04em; margin: 12px 0; }
    .pricing-price span { font-size: 16px; color: var(--text-muted); font-weight: 400; }
    .pricing-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
    .pricing-features { list-style: none; margin-bottom: 24px; }
    .pricing-features li { font-size: 14px; padding: 6px 0; color: var(--text-muted); }
    .pricing-features li::before { content: '✓  '; color: #10b981; font-weight: 700; }

    /* CTA */
    .cta-section {
      text-align: center;
      background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12));
      border: 1px solid rgba(99,102,241,0.2); border-radius: 24px;
      margin: 0 6vw 80px; padding: 60px 40px;
    }

    .cta-section h2 { margin-bottom: 12px; }
    .cta-section p { color: var(--text-muted); margin-bottom: 32px; font-size: 17px; }

    .email-form {
      display: flex; gap: 10px; max-width: 480px; margin: 0 auto; flex-wrap: wrap; justify-content: center;
    }

    .email-input {
      flex: 1; min-width: 240px; background: rgba(255,255,255,0.05); border: 1px solid var(--border);
      border-radius: 9999px; padding: 14px 20px; font-size: 15px; color: white; outline: none;
    }

    .email-input:focus { border-color: var(--primary); }

    /* FOOTER */
    footer {
      background: rgba(255,255,255,0.02); border-top: 1px solid var(--border);
      padding: 40px 6vw 24px;
    }

    .footer-grid {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px;
    }

    .footer-brand { font-size: 18px; font-weight: 900; margin-bottom: 8px; }
    .footer-tagline { font-size: 14px; color: var(--text-muted); line-height: 1.6; }
    .footer-col h4 { font-size: 13px; font-weight: 700; margin-bottom: 12px; }
    .footer-col ul { list-style: none; }
    .footer-col li { margin-bottom: 8px; }
    .footer-col a { font-size: 14px; color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
    .footer-col a:hover { color: var(--text); }
    .footer-bottom { border-top: 1px solid var(--border); padding-top: 20px; font-size: 13px; color: var(--text-muted); text-align: center; }

    @media (max-width: 768px) {
      nav { padding: 14px 20px; }
      .nav-links { display: none; }
      .hero { padding: 60px 20px 40px; min-height: 80vh; }
      section { padding: 60px 20px; }
      .stats-bar { padding: 12px 20px 40px; gap: 8px; }
      .stat-card { padding: 16px 20px; min-width: 110px; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .email-form { flex-direction: column; }
      .email-input { min-width: unset; width: 100%; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-brand">${projectTitle}</div>
    <ul class="nav-links">
      <li><a href="#">Features</a></li>
      <li><a href="#">Pricing</a></li>
      <li><a href="#">About</a></li>
    </ul>
    <a href="#" class="nav-cta">Get Started Free</a>
  </nav>

  <section class="hero">
    <div class="hero-bg"></div>
    <div class="hero-badge">✦ Now Available</div>
    <h1>The Future of<br /><span class="gradient-text">${projectTitle}</span><br />Is Here</h1>
    <p class="hero-sub">${description.slice(0, 140)}. Start building today and transform how you work.</p>
    <div class="hero-actions">
      <a href="#" class="btn-primary">Start For Free →</a>
      <a href="#" class="btn-secondary">Watch Demo</a>
    </div>
  </section>

  <div class="stats-bar">
    <div class="stat-card"><div class="stat-value">50K+</div><div class="stat-label">Happy Users</div></div>
    <div class="stat-card"><div class="stat-value">4.9★</div><div class="stat-label">Average Rating</div></div>
    <div class="stat-card"><div class="stat-value">99.9%</div><div class="stat-label">Uptime SLA</div></div>
    <div class="stat-card"><div class="stat-value">24/7</div><div class="stat-label">Support</div></div>
  </div>

  <section>
    <div class="section-label">✦ Features</div>
    <h2>Everything you need <span class="gradient-text">to succeed</span></h2>
    <p class="section-sub">Built for modern teams who move fast and ship quality products.</p>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <div class="feature-title">Lightning Fast</div>
        <div class="feature-desc">Deploy in seconds with our optimized infrastructure. Zero configuration needed.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <div class="feature-title">Beautiful Design</div>
        <div class="feature-desc">Stunning templates and components that make your product shine.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <div class="feature-title">Enterprise Security</div>
        <div class="feature-desc">Bank-level encryption and compliance with GDPR, SOC2, and more.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <div class="feature-title">Advanced Analytics</div>
        <div class="feature-desc">Real-time insights and dashboards to track every metric that matters.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🤝</div>
        <div class="feature-title">Team Collaboration</div>
        <div class="feature-desc">Work together seamlessly with your entire team from anywhere.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔗</div>
        <div class="feature-title">Integrations</div>
        <div class="feature-desc">Connect with 200+ tools including Slack, Notion, and GitHub.</div>
      </div>
    </div>
  </section>

  <section>
    <div class="section-label">✦ Testimonials</div>
    <h2>Loved by <span class="gradient-text">thousands</span></h2>
    <p class="section-sub">See what our customers are saying about us.</p>
    <div class="testimonials-grid">
      <div class="testimonial-card">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"This completely transformed how our team works. We're shipping 3x faster and the quality has never been better."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">SJ</div>
          <div><div class="testimonial-name">Sarah Johnson</div><div class="testimonial-role">CTO at TechCorp</div></div>
        </div>
      </div>
      <div class="testimonial-card">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"Absolutely incredible product. The design system alone saved us months of work. I recommend it to everyone."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">MC</div>
          <div><div class="testimonial-name">Marcus Chen</div><div class="testimonial-role">Founder at Launchpad</div></div>
        </div>
      </div>
      <div class="testimonial-card">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"We switched from three different tools to this one platform. Best decision we ever made for our startup."</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">PR</div>
          <div><div class="testimonial-name">Priya Sharma</div><div class="testimonial-role">Product Lead at Scale</div></div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="section-label">✦ Pricing</div>
    <h2>Simple, <span class="gradient-text">transparent</span> pricing</h2>
    <p class="section-sub">No hidden fees. Cancel anytime. Start free today.</p>
    <div class="pricing-grid">
      <div class="pricing-card">
        <div class="pricing-name">Starter</div>
        <div class="pricing-price">$0<span>/mo</span></div>
        <div class="pricing-desc">Perfect for trying things out</div>
        <ul class="pricing-features">
          <li>5 projects</li>
          <li>Basic analytics</li>
          <li>Community support</li>
          <li>2GB storage</li>
        </ul>
        <a href="#" class="btn-secondary" style="display:block;text-align:center;padding:12px;">Get Started Free</a>
      </div>
      <div class="pricing-card popular">
        <div class="popular-badge">Most Popular</div>
        <div class="pricing-name">Pro</div>
        <div class="pricing-price">$29<span>/mo</span></div>
        <div class="pricing-desc">For growing businesses</div>
        <ul class="pricing-features">
          <li>Unlimited projects</li>
          <li>Advanced analytics</li>
          <li>Priority support</li>
          <li>50GB storage</li>
          <li>Custom domains</li>
        </ul>
        <a href="#" class="btn-primary" style="display:block;text-align:center;padding:12px;">Start Pro Plan</a>
      </div>
      <div class="pricing-card">
        <div class="pricing-name">Enterprise</div>
        <div class="pricing-price">$99<span>/mo</span></div>
        <div class="pricing-desc">For large organizations</div>
        <ul class="pricing-features">
          <li>Everything in Pro</li>
          <li>SSO & advanced security</li>
          <li>Dedicated support</li>
          <li>500GB storage</li>
          <li>SLA guarantee</li>
        </ul>
        <a href="#" class="btn-secondary" style="display:block;text-align:center;padding:12px;">Contact Sales</a>
      </div>
    </div>
  </section>

  <div class="cta-section">
    <h2>Ready to <span class="gradient-text">get started?</span></h2>
    <p>Join 50,000+ users who are already building with ${projectTitle}. No credit card required.</p>
    <div class="email-form">
      <input type="email" class="email-input" placeholder="Enter your email address..." />
      <a href="#" class="btn-primary" style="white-space:nowrap">Start Free Trial</a>
    </div>
  </div>

  <footer>
    <div class="footer-grid">
      <div>
        <div class="footer-brand">${projectTitle}</div>
        <p class="footer-tagline">Building the future, one product at a time. Join thousands of teams already growing with us.</p>
      </div>
      <div class="footer-col">
        <h4>Product</h4>
        <ul>
          <li><a href="#">Features</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Changelog</a></li>
          <li><a href="#">Roadmap</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="#">About</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Press</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
          <li><a href="#">Security</a></li>
          <li><a href="#">Cookies</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">© 2025 ${projectTitle}. All rights reserved. Made with ♥</div>
  </footer>
</body>
</html>`;

  // ── React component files ────────────────────────────────────────────────────

  const appTsx = `import React from 'react'
import Navbar       from './components/Navbar'
import Hero         from './components/Hero'
import Stats        from './components/Stats'
import Features     from './components/Features'
import Testimonials from './components/Testimonials'
import Pricing      from './components/Pricing'
import Footer       from './components/Footer'

export default function App() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <Navbar title="${projectTitle}" />
      <Hero title="${projectTitle}" description="${description.slice(0, 100)}" />
      <Stats />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer title="${projectTitle}" />
    </div>
  )
}`;

  const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)`;

  const indexCss = `:root {
  --bg: #020617;
  --surface: #0f172a;
  --surface2: #1e293b;
  --primary: #6366f1;
  --accent: #a5b4fc;
  --primary-rgb: 99, 102, 241;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: rgba(255,255,255,0.08);
  --radius: 16px;
  --font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.6; overflow-x: hidden; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }`;

  const navbarTsx = `import React from 'react'
interface NavbarProps { title: string }
export default function Navbar({ title }: NavbarProps) {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '18px 6vw',
                  background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(20px)',
                  borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg, #818cf8, #a5b4fc)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{title}</div>
      <div style={{ display: 'flex', gap: 28 }}>
        {['Features','Pricing','About'].map(l => (
          <a key={l} href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{l}</a>
        ))}
      </div>
      <a href="#" style={{ background: 'var(--primary)', color: '#fff', borderRadius: 9999, padding: '10px 22px',
                           fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
        Get Started Free
      </a>
    </nav>
  )
}`;

  const heroTsx = `import React from 'react'
interface HeroProps { title: string; description: string }
export default function Hero({ title, description }: HeroProps) {
  return (
    <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', textAlign: 'center', padding: '80px 6vw 60px',
                      position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 50%)' }} />
      <div style={{ position: 'relative', maxWidth: 900 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.25)', borderRadius: 9999, padding: '8px 16px',
                      marginBottom: 24, fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                      letterSpacing: '0.1em', textTransform: 'uppercase', animation: 'fadeInUp 0.6s ease both' }}>
          ✦ Now Available
        </div>
        <h1 style={{ fontSize: 'clamp(42px, 8vw, 88px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1,
                     marginBottom: 20, animation: 'fadeInUp 0.6s 0.1s ease both',
                     background: 'linear-gradient(135deg, #818cf8, #a5b4fc, #c7d2fe, #818cf8)',
                     backgroundSize: '300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                     backgroundClip: 'text', animationName: 'gradientShift', animationDuration: '4s',
                     animationIterationCount: 'infinite' }}>
          The Future of {title} Is Here
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--text-muted)', maxWidth: 600,
                    margin: '0 auto 36px', lineHeight: 1.7, animation: 'fadeInUp 0.6s 0.2s ease both' }}>
          {description}. Start building today and transform how you work.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
                      animation: 'fadeInUp 0.6s 0.3s ease both' }}>
          <a href="#" style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff',
                               borderRadius: 9999, padding: '14px 32px', fontSize: 16, fontWeight: 700,
                               textDecoration: 'none', boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}>
            Start For Free →
          </a>
          <a href="#" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                               color: 'var(--text)', borderRadius: 9999, padding: '14px 32px',
                               fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>
            Watch Demo
          </a>
        </div>
      </div>
    </section>
  )
}`;

  const statsTsx = `import React from 'react'
const items = [
  { value: '50K+', label: 'Happy Users' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24/7', label: 'Support' },
]
export default function Stats() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', padding: '20px 6vw 60px' }}>
      {items.map(({ value, label }) => (
        <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                                  borderRadius: 'var(--radius)', padding: '20px 32px', textAlign: 'center',
                                  backdropFilter: 'blur(12px)', minWidth: 140 }}>
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em',
                        background: 'linear-gradient(135deg, var(--accent), #fff)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{label}</div>
        </div>
      ))}
    </div>
  )
}`;

  const featuresTsx = `import React from 'react'
const items = [
  { icon: '⚡', title: 'Lightning Fast', desc: 'Deploy in seconds with optimized infrastructure. Zero configuration needed.' },
  { icon: '🎨', title: 'Beautiful Design', desc: 'Stunning templates and components that make your product shine.' },
  { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-level encryption and compliance with GDPR, SOC2, and more.' },
  { icon: '📊', title: 'Advanced Analytics', desc: 'Real-time insights and dashboards to track every metric.' },
  { icon: '🤝', title: 'Team Collaboration', desc: 'Work together seamlessly with your entire team from anywhere.' },
  { icon: '🔗', title: 'Integrations', desc: 'Connect with 200+ tools including Slack, Notion, and GitHub.' },
]
export default function Features() {
  return (
    <section style={{ padding: '80px 6vw' }}>
      <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>✦ Features</div>
      <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 16 }}>
        Everything you need to succeed
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginTop: 48 }}>
        {items.map(({ icon, title, desc }) => (
          <div key={title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                                    borderRadius: 20, padding: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.15)',
                          border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{icon}</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}`;

  const testimonialsTsx = `import React from 'react'
const items = [
  { quote: '"This completely transformed how our team works. We\\'re shipping 3x faster and the quality has never been better."', name: 'Sarah Johnson', role: 'CTO at TechCorp', initials: 'SJ' },
  { quote: '"Absolutely incredible product. The design system alone saved us months of work. I recommend it to everyone."', name: 'Marcus Chen', role: 'Founder at Launchpad', initials: 'MC' },
  { quote: '"We switched from three different tools to this one platform. Best decision we ever made for our startup."', name: 'Priya Sharma', role: 'Product Lead at Scale', initials: 'PS' },
]
export default function Testimonials() {
  return (
    <section style={{ padding: '80px 6vw' }}>
      <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>✦ Testimonials</div>
      <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 16 }}>
        Loved by thousands
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginTop: 48 }}>
        {items.map(({ quote, name, role, initials }) => (
          <div key={name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 14, color: '#fbbf24', marginBottom: 12 }}>★★★★★</div>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>{quote}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{initials}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}`;

  const pricingTsx = `import React from 'react'
const plans = [
  { name: 'Starter', price: '$0', desc: 'Perfect for trying things out', features: ['5 projects','Basic analytics','Community support','2GB storage'], popular: false },
  { name: 'Pro', price: '$29', desc: 'For growing businesses', features: ['Unlimited projects','Advanced analytics','Priority support','50GB storage','Custom domains'], popular: true },
  { name: 'Enterprise', price: '$99', desc: 'For large organizations', features: ['Everything in Pro','SSO & advanced security','Dedicated support','500GB storage','SLA guarantee'], popular: false },
]
export default function Pricing() {
  return (
    <section style={{ padding: '80px 6vw' }}>
      <div style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>✦ Pricing</div>
      <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 16 }}>
        Simple, transparent pricing
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
                    gap: 20, marginTop: 48, maxWidth: 880, marginLeft: 'auto', marginRight: 'auto' }}>
        {plans.map(({ name, price, desc, features, popular }) => (
          <div key={name} style={{ position: 'relative', background: popular ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)',
                                    border: \`1px solid \${popular ? 'var(--primary)' : 'var(--border)'}\`,
                                    borderRadius: 20, padding: 28,
                                    boxShadow: popular ? '0 0 40px rgba(99,102,241,0.15)' : 'none' }}>
            {popular && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                            background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 800,
                            letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 9999 }}>
                Most Popular
              </div>
            )}
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.04em', margin: '12px 0' }}>{price}<span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{desc}</div>
            <ul style={{ listStyle: 'none', marginBottom: 24 }}>
              {features.map(f => <li key={f} style={{ fontSize: 14, padding: '6px 0', color: 'var(--text-muted)' }}>✓&nbsp;&nbsp;{f}</li>)}
            </ul>
            <a href="#" style={{ display: 'block', textAlign: 'center', padding: 12, borderRadius: 9999,
                                  background: popular ? 'linear-gradient(135deg,var(--primary),#7c3aed)' : 'rgba(255,255,255,0.06)',
                                  border: popular ? 'none' : '1px solid var(--border)',
                                  color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                                  boxShadow: popular ? '0 8px 24px rgba(99,102,241,0.3)' : 'none' }}>
              {popular ? 'Start Pro Plan' : name === 'Starter' ? 'Get Started Free' : 'Contact Sales'}
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}`;

  const footerTsx = `import React from 'react'
interface FooterProps { title: string }
export default function Footer({ title }: FooterProps) {
  return (
    <footer style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', padding: '40px 6vw 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>{title}</div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>Building the future, one product at a time. Join thousands of teams already growing with us.</p>
        </div>
        {[['Product',['Features','Pricing','Changelog','Roadmap']],['Company',['About','Blog','Careers','Press']],['Legal',['Privacy','Terms','Security','Cookies']]].map(([col, links]) => (
          <div key={col as string}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{col as string}</h4>
            <ul style={{ listStyle: 'none' }}>
              {(links as string[]).map(l => (
                <li key={l} style={{ marginBottom: 8 }}>
                  <a href="#" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
        © 2025 {title}. All rights reserved. Made with ♥
      </div>
    </footer>
  )
}`;

  const files: LocalGeneratedFile[] = [
    { path: "package.json",                    content: '{"name":"design-project","private":true,"version":"1.0.0","type":"module","scripts":{"dev":"vite","build":"tsc && vite build","preview":"vite preview"},"dependencies":{"react":"^18.3.0","react-dom":"^18.3.0"},"devDependencies":{"@types/react":"^18.3.0","@types/react-dom":"^18.3.0","@vitejs/plugin-react":"^4.3.0","typescript":"^5.4.0","vite":"^5.4.0"}}' },
    { path: "vite.config.ts",                  content: "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    host: '0.0.0.0',\n    port: 5173,\n    allowedHosts: 'all',\n    strictPort: true,\n  },\n})\n" },
    { path: "index.html",                      content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${projectTitle}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>` },
    { path: "src/main.tsx",                    content: mainTsx },
    { path: "src/App.tsx",                     content: appTsx },
    { path: "src/index.css",                   content: indexCss },
    { path: "src/components/Navbar.tsx",       content: navbarTsx },
    { path: "src/components/Hero.tsx",         content: heroTsx },
    { path: "src/components/Stats.tsx",        content: statsTsx },
    { path: "src/components/Features.tsx",     content: featuresTsx },
    { path: "src/components/Testimonials.tsx", content: testimonialsTsx },
    { path: "src/components/Pricing.tsx",      content: pricingTsx },
    { path: "src/components/Footer.tsx",       content: footerTsx },
  ];

  return {
    projectTitle,
    description,
    files,
    previewHtml,
    workflowLogs: [
      { agent: "Design Architect", action: "Analyzed requirements and established design system" },
      { agent: "Layout Engineer", action: "Built responsive grid and section structure" },
      { agent: "Visual Designer", action: "Applied color palette, typography, and animations" },
      { agent: "QA Engineer", action: "Validated responsiveness and cross-browser compatibility" },
    ],
  };
}
