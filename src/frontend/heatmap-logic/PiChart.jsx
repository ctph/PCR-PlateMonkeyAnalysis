// import React, { useEffect, useState } from "react";
// import Plot from "react-plotly.js";

// const SampleTypePieChart = ({ csvData }) => {
//   const [sampleTypeCounts, setSampleTypeCounts] = useState({});

//   useEffect(() => {
//     if (!csvData || !csvData.length) return;

//     const counts = {};

//     csvData.forEach((row) => {
//       const sampleId = row["Sample iD"];
//       if (!sampleId || typeof sampleId !== "string") return;

//       const parts = sampleId.split("_");
//       const sampleTypeRaw = parts.slice(2).join("_").trim();
//       const sampleType = sampleTypeRaw.toUpperCase(); // normalize case

//       if (sampleType) {
//         counts[sampleType] = (counts[sampleType] || 0) + 1;
//       }
//     });

//     setSampleTypeCounts(counts);
//   }, [csvData]);

//   const labels = Object.keys(sampleTypeCounts);
//   const values = Object.values(sampleTypeCounts);

//   return (
//     <div style={{ textAlign: "center", marginTop: 30 }}>
//       <h2>Sample Type Distribution</h2>
//       <Plot
//         data={[
//           {
//             type: "pie",
//             labels: labels,
//             values: values,
//             textinfo: "label+percent",
//             insidetextorientation: "radial",
//             marker: {
//               line: {
//                 color: "#000",
//                 width: 1
//               }
//             }
//           },
//         ]}
//         layout={{
//           width: 600,
//           height: 500,
//           showlegend: true,
//           legend: { orientation: "v", x: 1, y: 1 },
//         }}
//       />
//     </div>
//   );
// };

// export default SampleTypePieChart;


import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const SampleTypePieChart = ({ csvData, labelMode = "AUTO", prettyUnderscores = true }) => {
  const [sampleTypeCounts, setSampleTypeCounts] = useState({});

  // NUMBER_NUMBER_* pattern (e.g., 20250012345_1_ORAL FLUIDS)
  const v1Pattern = /^\s*\d+_\d+_.+/;

  const makeLabel = (raw) => {
    if (raw == null) return null;
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

    // AUTO mode:
    if (v1Pattern.test(s)) {
      // looks like Version 1 -> strip
      const parts = s.split("_");
      const tail = parts.slice(2).join("_").trim();
      return tail ? tail.toUpperCase() : "(UNKNOWN)";
    } else {
      // Version 2 or anything else -> raw
      return prettyUnderscores ? s.replace(/_/g, " ") : s;
    }
  };

  useEffect(() => {
    if (!csvData || !csvData.length) {
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

  const labels = Object.keys(sampleTypeCounts);
  const values = Object.values(sampleTypeCounts);

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
            marker: { line: { color: "#000", width: 1 } },
          },
        ]}
        layout={{
          width: 600,
          height: 500,
          showlegend: true,
          legend: { orientation: "v", x: 1, y: 1 },
        }}
        config={{ displaylogo: false, responsive: true }}
      />
    </div>
  );
};

export default SampleTypePieChart;
