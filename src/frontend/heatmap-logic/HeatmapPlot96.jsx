import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ColorHandling from "./ColorHandling";
import { getNextUnusedWell } from "./DuplicateWellPosition";
// import TargetFilter from "./TargetFilter";

const HeatmapPlot = () => {
  const [zData, setZData] = useState(Array.from({ length: 72 }, () => Array(72).fill(null)));
  const [colorRanges, setColorRanges] = useState([
    { color: "#0000ff", min: 0, max: 10 },
    { color: "#ff0000", min: 10, max: 20 },
  ]);
  const [wellPositionMap, setWellPositionMap] = useState({});
  const [selectedTarget, setSelectedTarget] = useState("ALL");

  // Load well position map from JSON once
  useEffect(() => {
    fetch("/96position_map.json")
      .then((res) => res.json())
      .then((data) => setWellPositionMap(data));
  }, []);

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file || Object.keys(wellPositionMap).length === 0) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const grid = Array.from({ length: 72 }, () => Array(72).fill(null));

        results.data.forEach((row) => {
          const well = row["Well no"];
          const ctValue = row["Ct value"];

          if (!well || ctValue === undefined) return;

          const value = ctValue.trim().toUpperCase() === "UNDETERMINED" ? 0 : parseFloat(ctValue);
          const coords = getNextUnusedWell(well, wellPositionMap);

          if (coords) {
            const [r, c] = coords;
            grid[r][c] = value;
          }
        });

        setZData(grid);
      },
    });
  };


  const createCustomColorscale = () => {
    const zmin = Math.min(...colorRanges.map((r) => r.min));
    const zmax = Math.max(...colorRanges.map((r) => r.max));
    return colorRanges.flatMap((r) => [
      [(r.min - zmin) / (zmax - zmin), r.color],
      [(r.max - zmin) / (zmax - zmin), r.color],
    ]);
  };

  return (
    <div style={{ textAlign: "center", padding: 5 }}>
      <h2>96 Well Plate Heatmap</h2>

      <div style={{ marginBottom: 20 }}>
        {/* <TargetFilter selectedTarget={selectedTarget} setSelectedTarget={setSelectedTarget} /> */}
        <input
          type="file"
          accept=".csv"
          id="csv-upload"
          style={{ display: "none" }}
          onChange={handleCSVUpload}
        />
        <Button icon={<UploadOutlined />} onClick={() => document.getElementById("csv-upload").click()}>
          Upload CSV
        </Button>
      </div>

      <ColorHandling colorRanges={colorRanges} setColorRanges={setColorRanges} />

      <Plot
        data={[
          {
            z: zData,
            type: "heatmap",
            colorscale: createCustomColorscale(),
            showscale: true,
            xgap: 1,
            ygap: 1,
          },
        ]}
        layout={{
          width: 800,
          height: 800,
          title: "96 Well Plate Heatmap",
          xaxis: {
            title: "Column",
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