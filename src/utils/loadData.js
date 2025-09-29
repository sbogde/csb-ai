import Papa from 'papaparse';

const COLOR_CYCLE = [
  '#1d4ed8',
  '#b91c1c',
  '#059669',
  '#7c3aed',
  '#ea580c',
  '#0f766e',
  '#facc15',
  '#111827'
];

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.text();
}

async function loadCSV(path) {
  const text = await fetchText(path);
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data ?? []),
      error: reject
    });
  });
}

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalisePoints(rows) {
  return rows
    .map((row) => ({
      x: parseNumber(row.x) ?? 0,
      y: parseNumber(row.y) ?? 0,
      cluster: parseNumber(row.cluster) ?? -1,
      ball: row.ball ?? '',
      thumb: row.thumb ?? ''
    }))
    .filter((row) => row.ball && row.thumb);
}

function normaliseSummary(rows) {
  return rows
    .map((row) => ({
      source_image: row.source_image ?? '',
      cluster: parseNumber(row.cluster) ?? -1,
      count: parseNumber(row.count) ?? 0
    }))
    .filter((row) => row.source_image);
}

export async function loadAllData() {
  const [pointsRows, summaryRows, labels] = await Promise.all([
    loadJSON('/data/points.json'),
    loadCSV('/data/cluster_summary.csv'),
    loadJSON('/data/cluster_labels.json')
  ]);

  return {
    points: normalisePoints(pointsRows),
    summary: normaliseSummary(summaryRows),
    labels: labels ?? {}
  };
}

export function inferClusterPalette(labels) {
  const entries = Object.entries(labels || {});
  if (entries.length === 0) {
    return {};
  }
  return entries.reduce((acc, [clusterId], index) => {
    acc[clusterId] = COLOR_CYCLE[index % COLOR_CYCLE.length];
    return acc;
  }, {});
}

export { loadCSV, loadJSON };
