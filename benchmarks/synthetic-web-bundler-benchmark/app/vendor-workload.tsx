import { proxy, useSnapshot } from "valtio";

const workloadState = proxy({ selected: 0 });
const points = Array.from({ length: 48 }, (_, index) => ({
  day: new Date(Date.UTC(2025, 0, index + 1)).toISOString().slice(0, 10),
  value: Math.round(10 + (index / 47) * 90),
}));

// These packages were selected independently for the synthetic fixture. They
// cover editor, markup, charting, mapping, document, and parser module shapes
// without mirroring any source application's dependency inventory.
const heavyPublicWorkloads = [
  () => import("monaco-editor"),
  () => import("markdown-it"),
  () => import("prismjs"),
  () => import("echarts"),
  () => import("leaflet"),
  () => import("pdf-lib"),
  () => import("mammoth"),
  () => import("fast-xml-parser"),
] as const;

export function VendorWorkload() {
  "use memo";

  const snapshot = useSnapshot(workloadState);
  const point = points[snapshot.selected % points.length];
  const loadHeavyPublicWorkloads = () => {
    void Promise.all(heavyPublicWorkloads.map((load) => load()));
  };

  return (
    <section aria-label="Independent public package workload">
      <h2>Public package workload</h2>
      <p>
        Selected synthetic point: {point.day} / {point.value}
      </p>
      <button
        onClick={() => {
          workloadState.selected = (workloadState.selected + 1) % points.length;
        }}
        type="button"
      >
        Advance synthetic point
      </button>
      <button onClick={loadHeavyPublicWorkloads} type="button">
        Load independent editor, mapping, chart, and document packages
      </button>
    </section>
  );
}
