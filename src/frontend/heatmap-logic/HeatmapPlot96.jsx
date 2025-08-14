import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button, message, Tag } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ColorHandling from "./ColorHandling";
import TargetFilter from "./TargetFilter";
import { createGetNextUnusedWell } from "./DuplicateWellPosition";
import SampleTypePieChart from "./PiChart";

const HeatmapPlot = () => {
  const gridSize = 72;
  const blockHeight = 8;
  const blockWidth = 12; // for vertical borders
  const gapRows = 1;

  const emptyGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(-1));
  const emptyTextGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));

  const [zData, setZData] = useState(emptyGrid);
  const [textData, setTextData] = useState(emptyTextGrid);
  const [csvData, setCsvData] = useState([]);

  // ✅ adaptive targets
  const [targets, setTargets] = useState(["ALL"]);
  const [selectedTarget, setSelectedTarget] = useState("ALL");

  const [wellPositionMap, setWellPositionMap] = useState({});
  const [fileName, setFileName] = useState("");

  const [colorRanges, setColorRanges] = useState([
    { color: "#9b9b9b", min: 0, max: 10 },
  ]);

  useEffect(() => {
    fetch("/96position_map.json")
      .then((res) => res.json())
      .then((data) => setWellPositionMap(data))
      .catch(() => {
        // optional: show a warning if the map fails to load
      });
  }, []);

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setFileName(file.name);
        message.success(`File "${file.name}" uploaded successfully`);
        event.target.value = ""; // allow re-selecting same file
      },
      error: (err) => {
        message.error(`Upload failed: ${err.message || "Parse error"}`);
        event.target.value = "";
      },
    });
  };

  // ✅ derive unique targets from CSV adaptively
  useEffect(() => {
    if (!csvData?.length) {
      setTargets(["ALL"]);
      setSelectedTarget("ALL");
      return;
    }

    const unique = Array.from(
      new Set(
        csvData
          .map((r) => (r["Target"] ?? "").toString().trim().toUpperCase())
          .filter(Boolean)
      )
    ).sort();

    const nextTargets = ["ALL", ...unique];
    setTargets(nextTargets);

    // reset selection if previous target no longer exists
    if (!nextTargets.includes(selectedTarget)) {
      setSelectedTarget("ALL");
    }
  }, [csvData]);

  useEffect(() => {
    if (!csvData.length || Object.keys(wellPositionMap).length === 0) return;

    const getNextUnusedWell = createGetNextUnusedWell();
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(-1));
    const textGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));

    csvData.forEach((row) => {
      const assay = row["Assay"];
      const well = row["Well no"];
      const ctRaw = row["Ct value"];
      const target = row["Target"]?.toString().trim().toUpperCase();
      const sampleId = row["Sample iD"] || "N/A";
      const rowNo = row["Row.No"] || "N/A";
      const colNo = row["Column no"] || "N/A";

      if (!well || ctRaw === undefined) return;
      if (selectedTarget !== "ALL" && target !== selectedTarget) return;

      const isUndetermined = ctRaw.toString().trim().toUpperCase() === "UNDETERMINED";
      const value = isUndetermined ? -1 : parseFloat(ctRaw);
      const coords = getNextUnusedWell(well, wellPositionMap);
      const displayCt = isUndetermined ? "UNDETERMINED" : value;

      if (coords && !isNaN(value)) {
        const [r, c] = coords;
        grid[r][c] = value;
        textGrid[r][c] =
          `Assay: ${assay}<br>` +
          `Well: ${well}<br>` +
          `Sample ID: ${sampleId}<br>` +
          `Ct: ${displayCt}<br>` +
          `Row.No: ${rowNo}<br>` +
          `Column no: ${colNo}`;
      }
    });

    // Clear gap rows for double border
    for (let row = blockHeight; row < gridSize; row += blockHeight) {
      const gapStart = row - 1;
      const gapEnd = gapStart + gapRows;
      if (gapEnd < gridSize) {
        for (let r = gapStart; r <= gapEnd; r++) {
          for (let c = 0; c < gridSize; c++) {
            grid[r][c] = -1;
            textGrid[r][c] = "";
          }
        }
      }
    }

    setZData(grid.map((row) => [...row]));
    setTextData(textGrid.map((row) => [...row]));
  }, [csvData, selectedTarget, wellPositionMap]);

  const createCustomColorscale = () => {
    const customRanges = [
      { color: "#ffffff", min: -1, max: -1 }, // empty wells
      ...colorRanges,
    ];
    const zmin = Math.min(...customRanges.map((r) => r.min));
    const zmax = Math.max(...customRanges.map((r) => r.max));
    return customRanges.flatMap((r) => [
      [(r.min - zmin) / (zmax - zmin), r.color],
      [(r.max - zmin) / (zmax - zmin), r.color],
    ]);
  };

  const zmin = Math.min(-1, ...colorRanges.map((r) => r.min));
  const zmax = Math.max(...colorRanges.map((r) => r.max));

  // Borders array
  const borders = [];

  // Horizontal double borders every 8 rows
  for (let row = blockHeight; row < gridSize; row += blockHeight) {
    borders.push({
      type: "line",
      xref: "x",
      yref: "y",
      x0: -0.5,
      x1: gridSize - 0.5,
      y0: row - 0.5,
      y1: row - 0.5,
      line: { color: "black", width: 2 },
    });
    borders.push({
      type: "line",
      xref: "x",
      yref: "y",
      x0: -0.5,
      x1: gridSize - 0.5,
      y0: row + 0.5,
      y1: row + 0.5,
      line: { color: "black", width: 2 },
    });
  }

  // Vertical borders every 12 columns
  for (let col = blockWidth; col < gridSize; col += blockWidth) {
    borders.push({
      type: "line",
      xref: "x",
      yref: "y",
      x0: col - 0.5,
      x1: col - 0.5,
      y0: -0.5,
      y1: gridSize - 0.5,
      line: { color: "black", width: 2 },
    });
    // If you want double vertical borders, uncomment and adjust:
    // borders.push({
    //   type: 'line',
    //   xref: 'x',
    //   yref: 'y',
    //   x0: col + 0.5,
    //   x1: col + 0.5,
    //   y0: -0.5,
    //   y1: gridSize - 0.5,
    //   line: { color: 'black', width: 2 }
    // });
  }

  return (
    <div style={{ textAlign: "center", padding: 5 }}>
      <h2>96 Well Plate Heatmap</h2>

      <div style={{ marginBottom: 20 }}>
        {/* ✅ adaptive target filter */}
        <TargetFilter
          selectedTarget={selectedTarget}
          setSelectedTarget={setSelectedTarget}
          targets={targets}
        />

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

        {fileName && (
          <div style={{ marginTop: 10 }}>
            <Tag color="green">📄 {fileName}</Tag>
          </div>
        )}
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
          shapes: borders,
        }}
      />

      <SampleTypePieChart csvData={csvData} />
    </div>
  );
};

export default HeatmapPlot;
