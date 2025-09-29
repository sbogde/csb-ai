import { useEffect, useState } from 'react';
import Hero from './components/Hero.jsx';
import Method from './components/Method.jsx';
import Explore from './components/Explore.jsx';
import CaseStudies from './components/CaseStudies.jsx';
import Credits from './components/Credits.jsx';
import Tour from './components/Tour.jsx';
import { loadAllData, inferClusterPalette } from './utils/loadData.js';

export default function App() {
  const [runTour, setRunTour] = useState(false);
  const [data, setData] = useState({ points: [], summary: [] });
  const [labels, setLabels] = useState({});
  const [palette, setPalette] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await loadAllData();
        if (!cancelled) {
          setData({ points: result.points, summary: result.summary });
          setLabels(result.labels);
          setPalette(inferClusterPalette(result.labels));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Unable to load motif data. Interactive map is unavailable.');
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

  useEffect(() => {
    if (!runTour) {
      return;
    }
    const exploreSection = document.getElementById('explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [runTour]);

  return (
    <div className="app">
      <Tour run={runTour} onClose={() => setRunTour(false)} />
      <Hero onStartTour={() => setRunTour(true)} />
      <main>
        <Method />
        <section className="section" aria-live="polite">
          {loading && <p className="status">Loading motif data…</p>}
          {error && <p className="status status--error">{error}</p>}
          {!loading && !error && (
            <Explore data={data} labels={labels} palette={palette} />
          )}
        </section>
        <CaseStudies />
        <Credits />
      </main>
    </div>
  );
}
