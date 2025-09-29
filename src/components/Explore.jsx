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

export default function Explore({ data, labels, palette }) {
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

    const selectedSet = new Set(selectedPoints);

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

      return {
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
          "Family: %{customdata[2]}" +
          "<extra></extra>",
        selectedpoints,
      };
    });
  }, [filteredPoints, clusterMeta, selectedPoints]);

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
    setSelectedPoints((prev) => {
      if (prev.includes(index)) {
        return prev.filter((idx) => idx !== index);
      }
      if (prev.length === 2) {
        return [prev[1], index];
      }
      return [...prev, index];
    });
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
          <h2>Explore the motif map</h2>
          <p className="muted">
            Each dot is a small patch of carving. Colours = families of
            similar-looking patches. Hover for the ball that patch came from.
          </p>
        </div>
        <div className="explore__layout">
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
            {selectionDetails.length > 0 && (
              <div className="explore__compare">
                <div className="explore__compare-header">
                  <h3>Compare</h3>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setSelectedPoints([])}
                    aria-label="Reset selected points"
                  >
                    Reset selection
                  </button>
                </div>
                {selectionDetails.length === 1 ? (
                  <div className="compare-single">
                    <p className="muted">Click a second point to compare.</p>
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
                    <p className="muted">Why grouped together?</p>
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
        </div>
      </div>
    </section>
  );
}
