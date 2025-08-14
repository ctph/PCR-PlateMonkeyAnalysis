import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button, message, Tag } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ColorHandling from "./ColorHandling384";
import TargetFilter from "./TargetFilter";
import SampleTypePieChart from "./PiChart";

const HeatmapPlotSmartchip = () => {
  const GRID = 72;
  const EMPTY = -1;

  const [zData, setZData] = useState(Array.from({ length: GRID }, () => Array(GRID).fill(0)));
  const [textData, setTextData] = useState(Array.from({ length: GRID }, () => Array(GRID).fill("")));
  const [colorRanges, setColorRanges] = useState([{ color: "#ffffff", min: -1, max: -1 }]);

  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState("");

  // dynamic target filter
  const [targets, setTargets] = useState(["ALL"]);
  const [selectedTarget, setSelectedTarget] = useState("ALL");

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data || []);
        setFileName(file.name);
        message.success(`File "${file.name}" uploaded successfully`);
        // allow selecting the same file again later
        event.target.value = "";
      },
      error: (err) => {
        message.error(`Upload failed: ${err.message || "Parse error"}`);
        event.target.value = "";
      },
    });
  };

  // Recompute dynamic targets whenever csvData changes
  useEffect(() => {
    if (!csvData?.length) {
      setTargets(["ALL"]);
      setSelectedTarget("ALL");
      return;
    }

    // Only consider rows with Assay === PRRSV to match your plotting filter
    const uniqueTargets = Array.from(
      new Set(
        csvData
          .filter(r => (r["Assay"] || "").toString().trim().toUpperCase() === "PRRSV")
          .map(r => (r["Target"] ?? "").toString().trim().toUpperCase())
          .filter(Boolean)
      )
    ).sort();

    const nextTargets = ["ALL", ...uniqueTargets];
    setTargets(nextTargets);

    // if current selection no longer valid, reset to ALL
    if (!nextTargets.includes(selectedTarget)) {
      setSelectedTarget("ALL");
    }
  }, [csvData]);

  // Build grids whenever data or selected target changes
  useEffect(() => {
    if (!csvData.length) return;

    const grid = Array.from({ length: GRID }, () => Array(GRID).fill(EMPTY));
    const hoverGrid = Array.from({ length: GRID }, () => Array(GRID).fill(""));

    csvData.forEach((row) => {
      const assayType = row["Assay"]?.toString().trim().toUpperCase();
      if (assayType !== "PRRSV") return;

      const target = row["Target"]?.toString().trim().toUpperCase();
      if (selectedTarget !== "ALL" && target !== selectedTarget) return;

      const ctRaw = row["Ct value"];
      const r = parseInt(row["Row.No"]);
      const c = parseInt(row["Column no"]);
      const sampleId = row["Sample iD"] ?? "";
      const well = row["Well no"];
      const assay = row["Assay"];

      if (Number.isNaN(r) || Number.isNaN(c) || ctRaw == null) return;

      const value = ctRaw.toString().trim().toUpperCase() === "UNDETERMINED" ? 0 : parseFloat(ctRaw);
      if (!Number.isNaN(value) && r >= 0 && r < GRID && c >= 0 && c < GRID) {
        grid[r][c] = value;
        hoverGrid[r][c] = `<br>Assay: ${assay}<br>Well Number: ${well}<br>Sample ID: ${sampleId}<br>Ct: ${value}`;
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

  return (
    <div style={{ textAlign: "center", padding: 5 }}>
      <h2>SmartChip Heatmap</h2>

      <div style={{ marginBottom: 20 }}>
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
          title: `SmartChip Heatmap - ${selectedTarget}`,
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
        }}
      />

      <SampleTypePieChart csvData={csvData} />
    </div>
  );
};

export default HeatmapPlotSmartchip;
