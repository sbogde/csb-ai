import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";

function sortClusterIds(ids) {
  return [...ids].sort((a, b) => {
    const aNum = Number(a);
    const bNum = Number(b);
    const aIsNum = Number.isFinite(aNum);
    const bIsNum = Number.isFinite(bNum);
    if (aIsNum && bIsNum) return aNum - bNum;
    if (aIsNum) return -1;
    if (bIsNum) return 1;
    return String(a).localeCompare(String(b));
  });
}

// Check if admin mode is enabled via URL parameter
function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check both search params and hash params
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.split("?")[1] || ""
    );

    const adminFromSearch = urlParams.get("admin") === "1";
    const adminFromHash = hashParams.get("admin") === "1";

    setIsAdmin(adminFromSearch || adminFromHash);
  }, []);

  return isAdmin;
}

// CompareCard component for always-visible compare panel
function CompareCard({ selections, onReset, labels, base, points }) {
  const slots = [selections[0], selections[1]];

  return (
    <div className="compare-card" aria-label="Compare selections" tabIndex={0}>
      <h3>Compare</h3>
      <div className="compare-slots">
        {slots.map((pointIndex, i) => {
          const point =
            pointIndex !== undefined
              ? points.find((p) => p.index === pointIndex)
              : null;
          const label = point
            ? labels[point.clusterId] ?? `Cluster ${point.clusterId}`
            : null;
          const imgUrl = point ? `${base}images/${point.ball}` : null;

          return (
            <div key={i} className="slot" aria-live="polite">
              <div className="slot-title">Slot {i ? "B" : "A"}</div>
              {point ? (
                <div className="slot-body">
                  {point.thumb ? (
                    <img src={point.thumb} alt={`Patch from ${point.ball}`} />
                  ) : (
                    <div className="thumb-placeholder">No thumb</div>
                  )}
                  <div className="meta">
                    <div className="family">{label}</div>
                    <div className="ball">Ball: {point.ball}</div>
                    <div className="file-link">
                      <a href={imgUrl} target="_blank" rel="noopener">
                        Open full image
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="slot-empty">Click any dot to add here</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="compare-actions">
        <button
          onClick={onReset}
          className="btn-secondary"
          aria-label="Reset comparison"
        >
          Reset selection
        </button>
      </div>
      <p className="hint">Tip: Click a dot to add/remove. Max two items.</p>
    </div>
  );
}

export default function Explore({ data, labels, palette }) {
  const isAdminMode = useAdminMode();
  const [adminSelections, setAdminSelections] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const base = import.meta.env.BASE_URL || "/";

  const points = useMemo(() => {
    const rows = data?.points ?? [];
    return rows.map((row, index) => ({
      ...row,
      index,
      clusterId: String(row.cluster ?? "unassigned"),
    }));
  }, [data]);

  const clusterIds = useMemo(() => {
    const ids = new Set(points.map((row) => row.clusterId));
    return sortClusterIds(ids);
  }, [points]);

  const [activeClusters, setActiveClusters] = useState(
    () => new Set(clusterIds)
  );
  const [ballFilter, setBallFilter] = useState("all");
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    setActiveClusters((prev) => {
      const next = new Set();
      clusterIds.forEach((id) => {
        if (prev.has(id)) {
          next.add(id);
        } else {
          next.add(id);
        }
      });
      return next;
    });
  }, [clusterIds]);

  const ballOptions = useMemo(() => {
    const set = new Set();
    points.forEach((row) => {
      if (row.ball) set.add(row.ball);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [points]);

  useEffect(() => {
    if (ballFilter !== "all" && !ballOptions.includes(ballFilter)) {
      setBallFilter("all");
    }
  }, [ballFilter, ballOptions]);

  const filteredPoints = useMemo(() => {
    return points.filter((row) => {
      if (!activeClusters.has(row.clusterId)) return false;
      if (ballFilter !== "all" && row.ball !== ballFilter) return false;
      return true;
    });
  }, [points, activeClusters, ballFilter]);

  const visibleIndices = useMemo(
    () => new Set(filteredPoints.map((row) => row.index)),
    [filteredPoints]
  );

  useEffect(() => {
    setSelectedPoints((prev) => prev.filter((idx) => visibleIndices.has(idx)));
  }, [visibleIndices]);

  // Keyboard accessibility - clear selection on Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedPoints([]);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const clusterMeta = useMemo(() => {
    return clusterIds.map((clusterId) => ({
      id: clusterId,
      label: labels?.[clusterId] ?? `Cluster ${clusterId}`,
      color: palette?.[clusterId] ?? "#64748b",
    }));
  }, [clusterIds, labels, palette]);

  const traces = useMemo(() => {
    const byCluster = new Map();
    filteredPoints.forEach((row) => {
      if (!byCluster.has(row.clusterId)) {
        byCluster.set(row.clusterId, []);
      }
      byCluster.get(row.clusterId).push(row);
    });

    const selectedSet = isAdminMode
      ? new Set(adminSelections.map((item) => item.index))
      : new Set(selectedPoints);

    return sortClusterIds(byCluster.keys()).map((clusterId) => {
      const rows = byCluster.get(clusterId) ?? [];
      const meta = clusterMeta.find((item) => item.id === clusterId);
      const clusterLabel = meta?.label ?? `Cluster ${clusterId}`;
      const baseColor = meta?.color ?? "#64748b";
      const selectedpoints = [];

      const markerSizes = rows.map((row, idx) => {
        if (selectedSet.has(row.index)) {
          selectedpoints.push(idx);
          return 12;
        }
        return 10;
      });

      const markerLines = rows.map((row) =>
        selectedSet.has(row.index) ? 3 : 1.5
      );

      const trace = {
        type: "scattergl",
        mode: "markers",
        name: clusterLabel,
        marker: {
          color: rows.map(() => baseColor),
          size: markerSizes,
          opacity: 1,
          line: {
            color: rows.map(() => "rgba(15,23,42,0.45)"),
            width: markerLines,
          },
          symbol: rows.map(() => "circle"),
        },
        x: rows.map((row) => row.x),
        y: rows.map((row) => row.y),
        customdata: rows.map((row) => [
          row.index,
          row.ball,
          clusterLabel,
          row.thumb,
        ]),
        hovertemplate:
          "Ball: %{customdata[1]}<br>" +
          "Family: %{customdata[2]}<br>" +
          "<b>Click to add/remove from Compare</b>" +
          "<extra></extra>",
        unselected: {
          marker: {
            opacity: 1,
            line: { color: "rgba(15,23,42,0.45)", width: 1.5 },
          },
        },
        selected: {
          marker: {
            opacity: 1,
            line: { color: "rgba(15,23,42,0.65)", width: 3 },
          },
        },
      };
      if (selectedpoints.length > 0) {
        trace.selectedpoints = selectedpoints;
      }
      return trace;
    });
  }, [
    filteredPoints,
    clusterMeta,
    selectedPoints,
    isAdminMode,
    adminSelections,
  ]);

  const handleClusterToggle = (clusterId) => {
    setActiveClusters((prev) => {
      const next = new Set(prev);
      if (next.has(clusterId)) {
        next.delete(clusterId);
      } else {
        next.add(clusterId);
      }
      return next;
    });
  };

  const handlePointClick = (event) => {
    const point = event?.points?.[0];
    if (!point || !Array.isArray(point.customdata)) return;
    const index = point.customdata[0];
    if (typeof index !== "number") return;

    if (isAdminMode) {
      // Admin mode: add to admin selections (last 2 only)
      setAdminSelections((prev) => {
        const newSelections = [...prev];
        const existingIndex = newSelections.findIndex(
          (item) => item.index === index
        );

        if (existingIndex !== -1) {
          // Remove if already selected
          newSelections.splice(existingIndex, 1);
        } else {
          // Add new selection
          const pointData = points.find((p) => p.index === index);
          if (pointData) {
            newSelections.push({
              index,
              ball: pointData.ball,
              thumb: pointData.thumb,
              clusterId: pointData.clusterId,
            });
          }
          // Keep only last 2 selections
          if (newSelections.length > 2) {
            newSelections.shift();
          }
        }
        return newSelections;
      });
    } else {
      // Normal mode: FIFO selection behavior for compare
      setSelectedPoints((prev) => {
        if (prev.includes(index)) {
          return prev.filter((idx) => idx !== index);
        }
        if (prev.length === 2) {
          // FIFO: remove oldest, add new
          return [prev[1], index];
        }
        return [...prev, index];
      });
    }
  };

  const selectionDetails = useMemo(() => {
    const map = new Map(points.map((row) => [row.index, row]));
    return selectedPoints.map((idx) => map.get(idx)).filter(Boolean);
  }, [points, selectedPoints]);

  const handleHover = (event) => {
    const point = event?.points?.[0];
    if (!point || !Array.isArray(point.customdata)) {
      setHoveredPoint(null);
      return;
    }
    const [, ball, clusterLabel, thumb] = point.customdata;
    setHoveredPoint({ ball, clusterLabel, thumb });
  };

  const handleUnhover = () => {
    setHoveredPoint(null);
  };

  // Admin mode functions
  const handleAddCaseStudy = () => {
    if (adminSelections.length !== 2) return;

    const [left, right] = adminSelections;
    const leftLabel = labels?.[left.clusterId] ?? `Cluster ${left.clusterId}`;
    const rightLabel =
      labels?.[right.clusterId] ?? `Cluster ${right.clusterId}`;

    const newCaseStudy = {
      title: `Comparison between ${left.ball} and ${right.ball}`,
      note: `Patches from ${leftLabel} and ${rightLabel} families - worth expert review?`,
      left: left.thumb,
      right: right.thumb,
    };

    setCaseStudies((prev) => [...prev, newCaseStudy]);
  };

  const handleDownloadCaseStudies = () => {
    const dataStr = JSON.stringify(caseStudies, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "case_studies.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearAdminSelections = () => {
    setAdminSelections([]);
  };

  const layout = useMemo(
    () => ({
      autosize: true,
      margin: { l: 40, r: 20, t: 40, b: 40 },
      hovermode: "closest",
      hoverlabel: {
        bgcolor: "#ffffff",
        font: { color: "#111111" },
      },
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#ffffff",
      legend: {
        bgcolor: "rgba(255,255,255,0.9)",
      },
      xaxis: {
        title: "UMAP 1",
        zeroline: false,
        showticklabels: false,
        gridcolor: "#eceff3",
      },
      yaxis: {
        title: "UMAP 2",
        zeroline: false,
        showticklabels: false,
        gridcolor: "#eceff3",
      },
      template: null,
    }),
    []
  );

  return (
    <section id="explore" className="section" data-tour="explore">
      <div className="section__inner explore">
        <div className="explore__header">
          <h2>
            Explore the motif map{" "}
            {isAdminMode && <span className="admin-badge">ADMIN MODE</span>}
          </h2>
          <p className="muted">
            Each dot is a tiny patch of carving. Colours show families of
            look-alike patches. Click any dot to add it to Compare (up to two).
            Hover to see which ball it came from.
            {isAdminMode &&
              " Admin mode: Click points to add them to the admin picker."}
          </p>
          <div className="tip-pill">
            Tip: click another dot to compare side-by-side. Click again to
            remove.
          </div>
        </div>
        <div
          className={`explore__layout ${
            isAdminMode ? "explore__layout--admin" : ""
          }`}
        >
          <div className="explore__plot" role="presentation">
            {traces.length === 0 ? (
              <div className="status status--error">
                No points match the current filters. Try enabling more clusters
                or resetting the ball filter.
              </div>
            ) : (
              <Plot
                data={traces}
                layout={layout}
                useResizeHandler
                style={{ width: "100%", height: "560px" }}
                config={{ displayModeBar: true, responsive: true }}
                onClick={handlePointClick}
                onHover={handleHover}
                onUnhover={handleUnhover}
              />
            )}
            {hoveredPoint && (
              <div className="explore__hover-preview">
                <img
                  src={hoveredPoint.thumb}
                  alt={`Patch preview from ${hoveredPoint.ball}`}
                />
                <div>
                  <p className="muted">Ball: {hoveredPoint.ball}</p>
                  <p className="muted">Family: {hoveredPoint.clusterLabel}</p>
                </div>
              </div>
            )}
          </div>
          <aside className="explore__sidebar" aria-label="Explore controls">
            <div className="explore__control">
              <h3>Clusters</h3>
              <ul className="explore__legend">
                {clusterMeta.map((cluster) => (
                  <li key={cluster.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={activeClusters.has(cluster.id)}
                        onChange={() => handleClusterToggle(cluster.id)}
                        aria-label={`Toggle ${cluster.label}`}
                      />
                      <span
                        className="legend-swatch"
                        style={{ backgroundColor: cluster.color }}
                        aria-hidden="true"
                      />
                      <span>{cluster.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="explore__control">
              <h3>Filter by ball</h3>
              <select
                value={ballFilter}
                onChange={(event) => setBallFilter(event.target.value)}
                aria-label="Filter points by source image"
              >
                <option value="all">All balls</option>
                {ballOptions.map((ball) => (
                  <option key={ball} value={ball}>
                    {ball}
                  </option>
                ))}
              </select>
            </div>

            {/* Always visible Compare panel */}
            <div className="explore__control">
              <CompareCard
                selections={selectedPoints}
                onReset={() => setSelectedPoints([])}
                labels={labels}
                base={base}
                points={points}
              />
            </div>

            {!isAdminMode && selectionDetails.length > 0 && (
              <div className="explore__compare">
                <div className="explore__compare-header">
                  <h3>Selection Details</h3>
                </div>
                {selectionDetails.length === 1 ? (
                  <div className="compare-single">
                    <p className="muted">One item selected for comparison.</p>
                    <dl>
                      <div>
                        <dt>Ball</dt>
                        <dd>{selectionDetails[0].ball}</dd>
                      </div>
                      <div>
                        <dt>Family</dt>
                        <dd>
                          {labels?.[selectionDetails[0].clusterId] ??
                            `Cluster ${selectionDetails[0].clusterId}`}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <div className="compare-duo">
                    <p className="muted">Two items ready for comparison.</p>
                    <div className="compare-grid">
                      {selectionDetails.slice(0, 2).map((point) => (
                        <article key={point.index} className="compare-card">
                          <header>
                            <h4>
                              {labels?.[point.clusterId] ??
                                `Cluster ${point.clusterId}`}
                            </h4>
                          </header>
                          <p className="muted">Ball: {point.ball}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
          {isAdminMode && (
            <aside className="explore__admin-panel" aria-label="Admin picker">
              <div className="admin-panel">
                <div className="admin-panel__header">
                  <h3>Admin Picker</h3>
                  <button
                    type="button"
                    className="btn btn--secondary btn--small"
                    onClick={handleClearAdminSelections}
                    aria-label="Clear admin selections"
                  >
                    Clear
                  </button>
                </div>
                <div className="admin-panel__selections">
                  {adminSelections.length === 0 ? (
                    <p className="muted">
                      Click points to select them for case study creation.
                    </p>
                  ) : (
                    <div className="admin-selections">
                      {adminSelections.map((selection, index) => (
                        <div key={selection.index} className="admin-selection">
                          <img
                            src={selection.thumb}
                            alt={`Patch from ${selection.ball}`}
                            className="admin-selection__thumb"
                          />
                          <div className="admin-selection__info">
                            <p>
                              <strong>Ball:</strong> {selection.ball}
                            </p>
                            <p>
                              <strong>Family:</strong>{" "}
                              {labels?.[selection.clusterId] ??
                                `Cluster ${selection.clusterId}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {adminSelections.length === 2 && (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleAddCaseStudy}
                  >
                    Add as case study
                  </button>
                )}
                {caseStudies.length > 0 && (
                  <div className="admin-panel__export">
                    <h4>Case Studies ({caseStudies.length})</h4>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={handleDownloadCaseStudies}
                    >
                      Download case_studies.json
                    </button>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
