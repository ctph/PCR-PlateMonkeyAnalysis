import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ColorHandling from "./ColorHandling";
import TargetFilter from "./TargetFilter";
import { createGetNextUnusedWell } from "./DuplicateWellPosition";
import SampleTypePieChart from "./PiChart";

const HeatmapPlot = () => {
  const emptyGrid = Array.from({ length: 72 }, () => Array(72).fill(-1));
  const emptyTextGrid = Array.from({ length: 72 }, () => Array(72).fill(""));

  const [zData, setZData] = useState(emptyGrid);
  const [textData, setTextData] = useState(emptyTextGrid);
  const [csvData, setCsvData] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState("ALL");
  const [wellPositionMap, setWellPositionMap] = useState({});

  const [colorRanges, setColorRanges] = useState([
    // { color: "#ffffff", min: -1, max: -1 }, // background for empty wells
    { color: "#ffffff", min: 0, max: 10 },
  ]);

  useEffect(() => {
    fetch("/96position_map.json")
      .then((res) => res.json())
      .then((data) => setWellPositionMap(data));
  }, []);

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => setCsvData(results.data),
    });
  };

  useEffect(() => {
    if (!csvData.length || Object.keys(wellPositionMap).length === 0) return;

    const getNextUnusedWell = createGetNextUnusedWell();
    const grid = Array.from({ length: 72 }, () => Array(72).fill(-1));
    const textGrid = Array.from({ length: 72 }, () => Array(72).fill(""));

    csvData.forEach((row) => {
      const well = row["Well no"];
      const ctRaw = row["Ct value"];
      const target = row["Target"]?.toString().trim().toUpperCase();
      const sampleId = row["Sample iD"] || "N/A";
      const rowNo = row["Row.No"] || "N/A";
      const colNo = row["Column no"] || "N/A";

      if (!well || ctRaw === undefined) return;
      if (selectedTarget !== "ALL" && target !== selectedTarget) return;

      const value = ctRaw.toString().trim().toUpperCase() === "UNDETERMINED" ? 0 : parseFloat(ctRaw);
      const coords = getNextUnusedWell(well, wellPositionMap);

      if (coords && !isNaN(value)) {
        const [r, c] = coords;
        grid[r][c] = value;
        textGrid[r][c] = `Well: ${well}<br>Sample ID: ${sampleId}<br>Ct: ${value}<br>Row.No: ${rowNo}<br>Column no: ${colNo}`;
      }
    });

    setZData([...grid.map(row => [...row])]);
    setTextData([...textGrid.map(row => [...row])]);
  }, [csvData, selectedTarget, wellPositionMap]);

  const createCustomColorscale = () => {
    const zmin = Math.min(...colorRanges.map(r => r.min));
    const zmax = Math.max(...colorRanges.map(r => r.max));
    return colorRanges.flatMap(r => [
      [(r.min - zmin) / (zmax - zmin), r.color],
      [(r.max - zmin) / (zmax - zmin), r.color]
    ]);
  };

  const zmin = Math.min(...colorRanges.map(r => r.min));
  const zmax = Math.max(...colorRanges.map(r => r.max));

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
          width: 1.5
        },
        fillcolor: 'rgba(0,0,0,0)' // transparent
      });
    }
  }

  return (
    <div style={{ textAlign: "center", padding: 5 }}>
      <h2>96 Well Plate Heatmap</h2>

      <div style={{ marginBottom: 20 }}>
        <TargetFilter selectedTarget={selectedTarget} setSelectedTarget={setSelectedTarget} />
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
        key={selectedTarget}
        data={[
          {
            z: zData,
            text: textData,
            hoverinfo: "text",
            hovertemplate: "%{text}<extra></extra>",
            type: "heatmap",
            colorscale: createCustomColorscale(),
            showscale: true,
            zmin,
            zmax,
            xgap: 0.3,
            ygap: 0.3,
          },
        ]}
        layout={{
          width: 800,
          height: 800,
          title: `96-Well Plate Heatmap - ${selectedTarget}`,
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
    <SampleTypePieChart csvData={csvData} />
    </div>
  );
};

export default HeatmapPlot;
