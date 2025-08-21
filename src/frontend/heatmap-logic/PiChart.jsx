// import React, { useEffect, useState } from "react";
// import Plot from "react-plotly.js";

// const SampleTypePieChart = ({
//   csvData,
//   labelMode = "AUTO",
//   prettyUnderscores = true,
//   maxLegendItems = 15,     // max distinct items to show; else collapse to "Other"
//   hoverOnlyThreshold = 12, // if > this many slices, hide ALL text/legend
// }) => {
//   const [counts, setCounts] = useState({});

//   const v1Pattern = /^\s*\d+_\d+_.+/;

//   const makeLabel = (raw) => {
//     if (raw == null) return null;
//     const s = String(raw).trim();
//     if (!s) return null;

//     if (labelMode === "RAW") return prettyUnderscores ? s.replace(/_/g, " ") : s;
//     if (labelMode === "TYPE") {
//       const parts = s.split("_");
//       const tail = parts.slice(2).join("_").trim();
//       return tail ? tail.toUpperCase() : "(UNKNOWN)";
//     }
//     if (v1Pattern.test(s)) {
//       const parts = s.split("_");
//       const tail = parts.slice(2).join("_").trim();
//       return tail ? tail.toUpperCase() : "(UNKNOWN)";
//     }
//     return prettyUnderscores ? s.replace(/_/g, " ") : s;
//   };

//   useEffect(() => {
//     if (!csvData?.length) return setCounts({});
//     const c = {};
//     csvData.forEach((row) => {
//       const keyName = ["Sample iD", "Sample ID", "SampleID"].find((k) => k in row);
//       const label = makeLabel(keyName ? row[keyName] : null);
//       if (!label) return;
//       c[label] = (c[label] || 0) + 1;
//     });
//     setCounts(c);
//   }, [csvData, labelMode, prettyUnderscores]);

//   // sort by count desc
//   const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

//   // group into "Other" if too many distinct types
//   let labels, values, customdata;
//   if (sorted.length > maxLegendItems) {
//     const top = sorted.slice(0, maxLegendItems);
//     const rest = sorted.slice(maxLegendItems);
//     labels = [...top.map(([l]) => l), "Other"];
//     values = [...top.map(([, v]) => v), rest.reduce((s, [, v]) => s + v, 0)];
//     // Put full breakdown into hover for the "Other" wedge
//     const otherDetails = rest.map(([l, v]) => `${l}: ${v}`).join("<br>");
//     customdata = [...top.map(() => ""), otherDetails];
//   } else {
//     labels = sorted.map(([l]) => l);
//     values = sorted.map(([, v]) => v);
//     customdata = Array(labels.length).fill("");
//   }

//   const tooManySlices = labels.length > hoverOnlyThreshold;

//   return (
//     <div style={{ textAlign: "center", marginTop: 30 }}>
//       <h2>Sample Type / ID Distribution</h2>
//       <Plot
//         data={[
//           {
//             type: "pie",
//             labels,
//             values,
//             hole: 0.45,
//             sort: false,
//             // HIDE text when too many slices; use hover only
//             textinfo: tooManySlices ? "none" : "label+percent",
//             // Always provide rich hover
//             hovertemplate:
//               "%{label}<br>%{value} (%{percent})<br>%{customdata}<extra></extra>",
//             customdata,
//             marker: { line: { color: "#000", width: 1 } },
//             showlegend: !tooManySlices, // hide legend when cluttered
//           },
//         ]}
//         layout={{
//           width: 700,
//           height: 520,
//           margin: { l: 40, r: 40, t: 60, b: 40 },
//           legend: { orientation: "v", x: 1, y: 1 },
//         }}
//         config={{ displaylogo: false, responsive: true }}
//       />
//     </div>
//   );
// };

// export default SampleTypePieChart;


import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const SampleTypePieChart = ({
  csvData,
  labelMode = "AUTO",
  prettyUnderscores = true,
  maxLegendItems = 15,
  hoverOnlyThreshold = 12,
}) => {
  const [counts, setCounts] = useState({});

  const v1Pattern = /^\s*\d+_\d+_.+/;

  const makeLabel = (raw) => {
    if (raw == null) return null;
    const s = String(raw).trim();
    if (!s) return null;

    if (labelMode === "RAW") return prettyUnderscores ? s.replace(/_/g, " ") : s;
    if (labelMode === "TYPE") {
      const parts = s.split("_");
      const tail = parts.slice(2).join("_").trim();
      return tail ? tail.toUpperCase() : "(UNKNOWN)";
    }
    if (v1Pattern.test(s)) {
      const parts = s.split("_");
      const tail = parts.slice(2).join("_").trim();
      return tail ? tail.toUpperCase() : "(UNKNOWN)";
    }
    return prettyUnderscores ? s.replace(/_/g, " ") : s;
  };

  useEffect(() => {
    if (!csvData?.length) return setCounts({});
    const c = {};
    csvData.forEach((row) => {
      const keyName = ["Sample iD", "Sample ID", "SampleID"].find((k) => k in row);
      const label = makeLabel(keyName ? row[keyName] : null);
      if (!label) return;
      c[label] = (c[label] || 0) + 1;
    });
    setCounts(c);
  }, [csvData, labelMode, prettyUnderscores]);

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  // group into "Other" if too many distinct types
  let labels, values, customdata;
  if (sorted.length > maxLegendItems) {
    const top = sorted.slice(0, maxLegendItems);
    const rest = sorted.slice(maxLegendItems);
    labels = [...top.map(([l]) => l), "Other"];
    values = [...top.map(([, v]) => v), rest.reduce((s, [, v]) => s + v, 0)];
    const otherDetails = rest.map(([l, v]) => `${l}: ${v}`).join("<br>");
    customdata = [...top.map(() => ""), otherDetails];
  } else {
    labels = sorted.map(([l]) => l);
    values = sorted.map(([, v]) => v);
    customdata = Array(labels.length).fill("");
  }

  // 👇 Build dual-format legend labels
  const legendNames = labels.map((l) => `${l} | ${makeLabel(l)}`);

  const tooManySlices = labels.length > hoverOnlyThreshold;

  return (
    <div style={{ textAlign: "center", marginTop: 30 }}>
      <h2>Sample Type Distribution</h2>
      <Plot
        data={[
          {
            type: "pie",
            labels,              // real categories (used for slices)
            values,
            hole: 0.45,
            sort: false,
            textinfo: tooManySlices ? "none" : "label+percent",
            hovertemplate:
              "%{label}<br>%{value} (%{percent})<br>%{customdata}<extra></extra>",
            customdata,
            marker: { line: { color: "#000", width: 1 } },
            showlegend: true,
            // 👇 Trick: override legend entries
            text: legendNames,
            textinfo: "none",   // don’t draw text inside slices from `text`
          },
        ]}
        layout={{
          width: 700,
          height: 520,
          margin: { l: 40, r: 40, t: 60, b: 40 },
          legend: { orientation: "v", x: 1, y: 1 },
        }}
        config={{ displaylogo: false, responsive: true }}
      />
    </div>
  );
};

export default SampleTypePieChart;


