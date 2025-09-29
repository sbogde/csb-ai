export default function Method() {
  return (
    <section id="method" className="section" data-tour="method">
      <div className="section__inner method">
        <h2>How the map works</h2>
        <p>
          We cut photos into small squares, keep the carved bits, and give each square a visual fingerprint.
        </p>
        <p>
          We place fingerprints on a map where similar carvings sit together, even though the axes are not centimetres.
        </p>
        <p>Colours mark families of look-alike carvings.</p>
        <p>The tool surfaces similarity; it does not assign meaning or date.</p>
        <figure className="method__figure">
          <img src="/img/symbol_map.png" alt="Fallback scatter overview of carved stone ball motifs" />
        </figure>
      </div>
    </section>
  );
}
