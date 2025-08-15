// import React, { useEffect, useState } from "react";
// import Plot from "react-plotly.js";

// const SampleTypePieChart = ({ csvData, labelMode = "AUTO", prettyUnderscores = true }) => {
//   const [sampleTypeCounts, setSampleTypeCounts] = useState({});

//   // NUMBER_NUMBER_* pattern (e.g., 20250012345_1_ORAL FLUIDS)
//   const v1Pattern = /^\s*\d+_\d+_.+/;

//   const makeLabel = (raw) => {
//     if (raw == null) return null;
//     const s = String(raw).trim();
//     if (!s) return null;

//     if (labelMode === "RAW") {
//       return prettyUnderscores ? s.replace(/_/g, " ") : s;
//     }
//     if (labelMode === "TYPE") {
//       const parts = s.split("_");
//       const tail = parts.slice(2).join("_").trim();
//       return tail ? tail.toUpperCase() : "(UNKNOWN)";
//     }

//     // AUTO mode:
//     if (v1Pattern.test(s)) {
//       // looks like Version 1 -> strip
//       const parts = s.split("_");
//       const tail = parts.slice(2).join("_").trim();
//       return tail ? tail.toUpperCase() : "(UNKNOWN)";
//     } else {
//       // Version 2 or anything else -> raw
//       return prettyUnderscores ? s.replace(/_/g, " ") : s;
//     }
//   };

//   useEffect(() => {
//     if (!csvData || !csvData.length) {
//       setSampleTypeCounts({});
//       return;
//     }

//     const counts = {};
//     csvData.forEach((row) => {
//       const label = makeLabel(row["Sample iD"]);
//       if (!label) return;
//       counts[label] = (counts[label] || 0) + 1;
//     });
//     setSampleTypeCounts(counts);
//   }, [csvData, labelMode, prettyUnderscores]);

//   const labels = Object.keys(sampleTypeCounts);
//   const values = Object.values(sampleTypeCounts);

//   return (
//     <div style={{ textAlign: "center", marginTop: 30 }}>
//       <h2>Sample Type / ID Distribution</h2>
//       <Plot
//         data={[
//           {
//             type: "pie",
//             labels,
//             values,
//             textinfo: "label+percent",
//             insidetextorientation: "radial",
//             marker: { line: { color: "#000", width: 1 } },
//           },
//         ]}
//         layout={{
//           width: 600,
//           height: 500,
//           showlegend: true,
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

const SampleTypePieChart = ({ csvData, labelMode = "AUTO", prettyUnderscores = true, maxLegendItems = 15 }) => {
  const [sampleTypeCounts, setSampleTypeCounts] = useState({});

  const v1Pattern = /^\s*\d+_\d+_.+/;

  const makeLabel = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s) return null;

    if (labelMode === "RAW") {
      return prettyUnderscores ? s.replace(/_/g, " ") : s;
    }
    if (labelMode === "TYPE") {
      const parts = s.split("_");
      const tail = parts.slice(2).join("_").trim();
      return tail ? tail.toUpperCase() : "(UNKNOWN)";
    }

    if (v1Pattern.test(s)) {
      const parts = s.split("_");
      const tail = parts.slice(2).join("_").trim();
      return tail ? tail.toUpperCase() : "(UNKNOWN)";
    } else {
      return prettyUnderscores ? s.replace(/_/g, " ") : s;
    }
  };

  useEffect(() => {
    if (!csvData?.length) {
      setSampleTypeCounts({});
      return;
    }
    const counts = {};
    csvData.forEach((row) => {
      const label = makeLabel(row["Sample iD"]);
      if (!label) return;
      counts[label] = (counts[label] || 0) + 1;
    });
    setSampleTypeCounts(counts);
  }, [csvData, labelMode, prettyUnderscores]);

  // Sort by count (desc) so top N are shown
  const sorted = Object.entries(sampleTypeCounts).sort((a, b) => b[1] - a[1]);

  let labels = [];
  let values = [];
  let hoverText = [];

  if (sorted.length > maxLegendItems) {
    const top = sorted.slice(0, maxLegendItems);
    const rest = sorted.slice(maxLegendItems);

    labels = [...top.map(([label]) => label), "Other"];
    values = [...top.map(([, val]) => val), rest.reduce((sum, [, val]) => sum + val, 0)];
    hoverText = [
      ...top.map(([label, val]) => `${label}: ${val}`),
      rest.map(([label, val]) => `${label}: ${val}`).join("<br>")
    ];
  } else {
    labels = sorted.map(([label]) => label);
    values = sorted.map(([, val]) => val);
    hoverText = sorted.map(([label, val]) => `${label}: ${val}`);
  }

  return (
    <div style={{ textAlign: "center", marginTop: 30 }}>
      <h2>Sample Type / ID Distribution</h2>
      <Plot
        data={[
          {
            type: "pie",
            labels,
            values,
            textinfo: "label+percent",
            insidetextorientation: "radial",
            hoverinfo: "text",
            text: labels,
            hovertext: hoverText,
            marker: { line: { color: "#000", width: 1 } }
          }
        ]}
        layout={{
          width: 600,
          height: 500,
          showlegend: true,
          legend: { orientation: "v", x: 1, y: 1 }
        }}
        config={{ displaylogo: false, responsive: true }}
      />
    </div>
  );
};

export default SampleTypePieChart;
