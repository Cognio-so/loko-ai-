export default function App() {
  const cards = ["Hero","Benefits","Onboarding","Testimonials"];
  return (
    <div className="app-shell">
      <section className="hero-block">
        <span className="intent-chip">startup mode</span>
        <h1>Create A Premium Lovable-style Responsive</h1>
        <p>Create a premium Lovable-style responsive website with a complete self-contained HTML preview, polished inline CSS, hero, social proof, product showcase, features, benefits, pricing, testimonials, FAQ, CTA, footer, smooth animations, mobile-first layout, refined typography, tasteful gradients, professional shadows, and startup-quality visual design.</p>
        <div className="button-row">
          <button className="primary-btn">Generate Premium</button>
          <button className="secondary-btn">Refine Further</button>
        </div>
      </section>
      <section className="card-grid">
        {cards.map((card, index) => (
          <article key={card} className="info-card">
            <span className="index-pill">0{index + 1}</span>
            <h3>{card}</h3>
            <p>Structured fallback content for a more premium and prompt-specific result.</p>
          </article>
        ))}
      </section>
    </div>
  );
}