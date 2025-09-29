import { useEffect, useState } from "react";

const DATA_URL = "/data/case_studies.json";

export default function CaseStudies() {
  const [studies, setStudies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
          throw new Error(`Failed to load case studies: ${response.status}`);
        }
        const payload = await response.json();
        if (!cancelled) {
          setStudies(Array.isArray(payload) ? payload : []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Case study examples are unavailable right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="case-studies" className="section" data-tour="case-studies">
      <div className="section__inner">
        <h2>Case studies</h2>
        <p>
          Hand-picked motif pairs for qualitative review. Swap in your own comparisons by editing
          <code> /public/data/case_studies.json</code>.
        </p>
        {loading && <p className="status">Loading case studies…</p>}
        {error && <p className="status status--error">{error}</p>}
        {!error && !loading && studies.length === 0 && (
          <p className="status">No case studies available yet.</p>
        )}
        {!error && !loading && studies.length > 0 && (
          <div className="case-grid" role="list">
            {studies.map((item, index) => (
              <article
                key={item.title ?? index}
                className="case-card"
                tabIndex={0}
                role="listitem"
              >
                <header>
                  <h3>{item.title}</h3>
                </header>
                <div className="case-card__thumbs">
                  <img
                    src={item.left}
                    alt={`Case study thumbnail from ${item.title}`}
                    loading="lazy"
                  />
                  <img
                    src={item.right}
                    alt={`Case study thumbnail from ${item.title}`}
                    loading="lazy"
                  />
                </div>
                <p className="muted case-card__note">{item.note}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
