export default function Credits() {
  return (
    <section id="credits" className="section section--credits" data-tour="credits">
      <div className="section__inner">
        <h2>Credits &amp; data access</h2>
        <p>
          Images and derived embeddings are shared under Creative Commons licences where applicable. Cite the
          Scotland&apos;s Ancient Stone Balls project when reusing material.
        </p>
        <p>
          Download the data powering this map: <a href="/data/points.csv">points.csv</a> &middot;{' '}
          <a href="/data/cluster_summary.csv">cluster_summary.csv</a>
        </p>
        <div className="credits-faq">
          <h3>What this map is</h3>
          <p>A visual index showing which carved motifs look alike in machine vision space.</p>
          <h3>What this map is not</h3>
          <p>
            It does not determine chronology, cultural meaning, or authenticity. Use it alongside traditional
            archaeological interpretation.
          </p>
        </div>
        <footer className="credits-footer">
          <p>
            © Sorin Bogde ·{' '}
            <a href="https://www.linkedin.com/in/sbogde/" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            ·{' '}
            <a href="https://www.guru.com/freelancers/sorin-bogde/reviews" target="_blank" rel="noreferrer">
              Guru profile
            </a>
            ·{' '}
            <a href="https://github.com/sbogde/csb-ai" target="_blank" rel="noreferrer">
              GitHub repository
            </a>
          </p>
        </footer>
      </div>
    </section>
  );
}
