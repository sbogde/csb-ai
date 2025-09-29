const placeholderExamples = [
  {
    title: 'Shared spiral-like motif across Ball 12 and Ball 34',
    left: 'TODO thumbnail',
    right: 'TODO thumbnail',
    note: 'Does this suggest a shared carving habit or tool?'
  },
  {
    title: 'Shared spiral-like motif across Ball 45 and Ball 78',
    left: 'TODO thumbnail',
    right: 'TODO thumbnail',
    note: 'Does this suggest a shared carving habit or tool?'
  },
  {
    title: 'Shared spiral-like motif across Ball 90 and Ball 102',
    left: 'TODO thumbnail',
    right: 'TODO thumbnail',
    note: 'Does this suggest a shared carving habit or tool?'
  }
];

export default function CaseStudies({ examples = placeholderExamples }) {
  return (
    <section id="case-studies" className="section" data-tour="case-studies">
      <div className="section__inner">
        <h2>Case studies</h2>
        <p>
          Short prompts for deeper archaeological interpretation. Swap the placeholders with thumbnail pairs once
          representative patches are selected.
        </p>
        <div className="case-grid">
          {examples.map((item, index) => (
            <article key={item.title ?? index} className="case-card">
              <header>
                <h3>{item.title}</h3>
              </header>
              <div className="case-card__thumbs">
                <div className="case-card__thumb">{item.left ?? 'TODO thumbnail'}</div>
                <div className="case-card__thumb">{item.right ?? 'TODO thumbnail'}</div>
              </div>
              <p className="muted case-card__note">{item.note ?? 'Does this suggest a shared carving habit or tool?'}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
