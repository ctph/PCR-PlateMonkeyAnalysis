import React, { useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ColorHandling from "./ColorHandling";

const HeatmapPlot = () => {
  const [zData, setZData] = useState(
    Array.from({ length: 8 }, () => Array(12).fill(null))
  );

  const [colorRanges, setColorRanges] = useState([
    { color: "#0000ff", min: 0, max: 10 },
    { color: "#ff0000", min: 10, max: 20 },
  ]);

  const xLabels = Array.from({ length: 12 }, (_, i) => i + 1);
  const yLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const grid = Array.from({ length: 8 }, () => Array(12).fill(null));
        results.data.forEach((row) => {
          const well = row["Well no"];
          const ctValue = row["Ct value"];
          if (well && ctValue !== undefined) {
            const rowLetter = well.charAt(0).toUpperCase();
            const colNumber = parseInt(well.slice(1), 10);
            const rowIndex = rowLetter.charCodeAt(0) - "A".charCodeAt(0);
            const colIndex = colNumber - 1;
            if (rowIndex >= 0 && rowIndex < 8 && colIndex >= 0 && colIndex < 12) {
              grid[rowIndex][colIndex] = ctValue === "UNDETERMINED" ? 0 : parseFloat(ctValue);
            }
          }
        });
        setZData(grid);
      },
    });
  };

  // Generate colorscale from colorRanges
  const createCustomColorscale = () => {
    const zmin = Math.min(...colorRanges.map((r) => r.min));
    const zmax = Math.max(...colorRanges.map((r) => r.max));
    return colorRanges.flatMap((r) => [
      [(r.min - zmin) / (zmax - zmin), r.color],
      [(r.max - zmin) / (zmax - zmin), r.color],
    ]);
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>94 Well Plate hHeatmap</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="file"
          accept=".csv"
          id="csv-upload"
          style={{ display: "none" }}
          onChange={handleCSVUpload}
        />
        <Button
          icon={<UploadOutlined />}
          onClick={() => document.getElementById("csv-upload").click()}
        >
          Upload CSV
        </Button>
      </div>

      {/* Color Handling */}
      <ColorHandling
        colorRanges={colorRanges}
        setColorRanges={setColorRanges}
      />

      {/* Plotly Heatmap */}
      <Plot
        data={[
          {
            z: zData,
            x: xLabels,
            y: yLabels,
            type: "heatmap",
            colorscale: createCustomColorscale(),
            showscale: true,
            xgap: 2,
            ygap: 2,
          },
        ]}
        layout={{
          width: 800,
          height: 600,
          title: "CT Value Heatmap",
          xaxis: {
            title: "Column",
            side: "top",
            showgrid: true, 
            gridcolor: "#ccc",
            zeroline: false,
          },
          yaxis: {
            title: "Row",
            autorange: "reversed",
            showgrid: true, 
            gridcolor: "#ccc",
            zeroline: false,
          },
          margin: { t: 50, b: 50, l: 50, r: 50 },
        }}
      />
    </div>
  );
};

export default HeatmapPlot;