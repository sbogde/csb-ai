export default function Hero({ onStartTour }) {
  return (
    <header id="hero" className="hero" data-tour="hero">
      <nav className="hero__nav">
        <div className="hero__brand">CSB Motif Explorer</div>
        <ul>
          <li><a href="#method">Method</a></li>
          <li><a href="#explore">Explore</a></li>
          <li><a href="#case-studies">Case Studies</a></li>
          <li><a href="#credits">Credits</a></li>
        </ul>
      </nav>
      <div className="hero__content">
        <div>
          <p className="eyebrow">AI-assisted motif clustering</p>
          <h1>What AI Notices in Scotland’s Carved Stone Balls</h1>
          <p className="lead">Each dot is a tiny carving; dots with the same colour look alike.</p>
          <div className="hero__actions">
            <button type="button" className="btn" onClick={onStartTour}>
              Start the tour
            </button>
            <a className="btn btn--secondary" href="#explore">
              Explore the map
            </a>
          </div>
        </div>
        <figure className="hero__figure">
          <img src="/img/symbol_map.png" alt="Static scatter plot of carved stone ball motifs" />
          <figcaption>Fallback scatter of motif fingerprints generated with CLIP + UMAP.</figcaption>
        </figure>
      </div>
    </header>
  );
}
