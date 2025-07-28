import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const SampleTypePieChart = ({ csvData }) => {
  const [sampleTypeCounts, setSampleTypeCounts] = useState({});

  useEffect(() => {
    if (!csvData || !csvData.length) return;

    const counts = {};

    csvData.forEach((row) => {
      const sampleId = row["Sample iD"];
      if (!sampleId || typeof sampleId !== "string") return;

      const parts = sampleId.split("_");
      const sampleTypeRaw = parts.slice(2).join("_").trim();
      const sampleType = sampleTypeRaw.toUpperCase(); // normalize case

      if (sampleType) {
        counts[sampleType] = (counts[sampleType] || 0) + 1;
      }
    });

    setSampleTypeCounts(counts);
  }, [csvData]);

  const labels = Object.keys(sampleTypeCounts);
  const values = Object.values(sampleTypeCounts);

  return (
    <div style={{ textAlign: "center", marginTop: 30 }}>
      <h2>Sample Type Distribution</h2>
      <Plot
        data={[
          {
            type: "pie",
            labels: labels,
            values: values,
            textinfo: "label+percent",
            insidetextorientation: "radial",
            marker: {
              line: {
                color: "#000",
                width: 1
              }
            }
          },
        ]}
        layout={{
          width: 600,
          height: 500,
          showlegend: true,
          legend: { orientation: "v", x: 1, y: 1 },
        }}
      />
    </div>
  );
};

export default SampleTypePieChart;