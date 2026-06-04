export default function App() {
  const cards = ["Hero","Product Preview","Features","Pricing"];
  return (
    <div className="app-shell">
      <section className="hero-block">
        <span className="intent-chip">saas mode</span>
        <h1>Mere Ko Chatgpt Website Ka</h1>
        <p>mere ko chatgpt website ka url link do</p>
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