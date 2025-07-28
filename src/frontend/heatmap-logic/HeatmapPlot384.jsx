import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ColorHandling from "./ColorHandling";
import TargetFilter384 from "./TargetFilter384";

const HeatmapPlot = () => {
  const [zData, setZData] = useState(Array.from({ length: 72 }, () => Array(72).fill(-1)));
  const [textData, setTextData] = useState(Array.from({ length: 72 }, () => Array(72).fill("")));
  const [colorRanges, setColorRanges] = useState([
    { color: "#ffffff", min: 0, max: 10 },
  ]);
  const [selectedTarget, setSelectedTarget] = useState("ALL");
  const [csvData, setCsvData] = useState([]);
  const [wellPositionMap, setWellPositionMap] = useState({});

  useEffect(() => {
    fetch("/384position_map.json")
      .then((res) => res.json())
      .then((data) => setWellPositionMap(data));
  }, []);

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  useEffect(() => {
    if (!csvData.length) return;

    const grid = Array.from({ length: 72 }, () => Array(72).fill(null));
    const hoverGrid = Array.from({ length: 72 }, () => Array(72).fill(""));

    csvData.forEach((row) => {
      const well = row["Well no"];
      const ctRaw = row["Ct value"];
      const target = row["Target"]?.toString().trim().toUpperCase();
      const row_id = parseInt(row["Row.No"]);
      const col_id = parseInt(row["Column no"]);
      const sampleId = row["Sample iD"];

      if (!well || ctRaw === undefined || isNaN(row_id) || isNaN(col_id)) return;
      if (selectedTarget !== "ALL" && target !== selectedTarget) return;

      const value = ctRaw.toString().trim().toUpperCase() === "UNDETERMINED" ? 0 : parseFloat(ctRaw);

      if (!isNaN(value)) {
        grid[row_id][col_id] = value;
        hoverGrid[row_id][col_id] = `Well: ${well}<br>Sample ID: ${sampleId}<br>Ct: ${value}<br>Row: ${row_id}<br>Column: ${col_id}`;
      }
    });

    setZData(grid);
    setTextData(hoverGrid);
  }, [csvData, selectedTarget]);

  const createCustomColorscale = () => {
    const zmin = Math.min(...colorRanges.map((r) => r.min));
    const zmax = Math.max(...colorRanges.map((r) => r.max));
    return colorRanges.flatMap((r) => [
      [(r.min - zmin) / (zmax - zmin), r.color],
      [(r.max - zmin) / (zmax - zmin), r.color],
    ]);
  };

  const zmin = Math.min(...colorRanges.map((r) => r.min));
  const zmax = Math.max(...colorRanges.map((r) => r.max));

  const blockHeight = 8;
  const blockWidth = 12;
  const gridSize = 72;

  const borders = [];
  for (let row = 0; row < gridSize; row += blockHeight) {
    for (let col = 0; col < gridSize; col += blockWidth) {
      borders.push({
        type: 'rect',
        xref: 'x',
        yref: 'y',
        x0: col - 0.5,
        y0: row - 0.5,
        x1: col + blockWidth - 0.5,
        y1: row + blockHeight - 0.5,
        line: {
          color: 'black',
          width: 3
        },
        fillcolor: 'rgba(0,0,0,0)' // transparent
      });
    }
  }

  return (
    <div style={{ textAlign: "center", padding: 5 }}>
      <h2>384 Well Plate Heatmap</h2>

      <div style={{ marginBottom: 20 }}>
        <TargetFilter384 selectedTarget={selectedTarget} setSelectedTarget={setSelectedTarget} />
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
            text: textData,
            hoverinfo: "text",
            hovertemplate: "%{text}<extra></extra>",
            type: "heatmap",
            colorscale: createCustomColorscale(),
            showscale: true,
            zmin: zmin,
            zmax: zmax,
            xgap: 2,
            ygap: 2,
          },
        ]}
        layout={{
          width: 800,
          height: 800,
          title: `384-Well Plate Heatmap - ${selectedTarget}`,
          plot_bgcolor: "#000000",
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
          shapes: borders
        }}
      />
    </div>
  );
};

export default HeatmapPlot;
