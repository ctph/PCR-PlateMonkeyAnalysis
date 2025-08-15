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

  // Assay filter
  const [assays, setAssays] = useState(["ALL"]);
  const [selectedAssay, setSelectedAssay] = useState("ALL");

  // Target filter (depends on selected assay)
  const [targets, setTargets] = useState(["ALL"]);
  const [selectedTarget, setSelectedTarget] = useState("ALL");

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // auto-number Row/Col/Ct where possible
      complete: (results) => {
        setCsvData(results.data || []);
        setFileName(file.name);
        message.success(`File "${file.name}" uploaded successfully`);
        // allow re-selecting the same file
        event.target.value = "";
      },
      error: (err) => {
        message.error(`Upload failed: ${err.message || "Parse error"}`);
        event.target.value = "";
      },
    });
  };

  // Build Assay list on csv load
  useEffect(() => {
    if (!csvData?.length) {
      setAssays(["ALL"]);
      setSelectedAssay("ALL");
      setTargets(["ALL"]);
      setSelectedTarget("ALL");
      return;
    }

    const uniqueAssays = Array.from(
      new Set(
        csvData
          .map((r) => (r["Assay"] ?? "").toString().trim().toUpperCase())
          .filter(Boolean)
      )
    ).sort();

    const nextAssays = ["ALL", ...uniqueAssays];
    setAssays(nextAssays);

    // keep selection if still valid, else reset
    if (!nextAssays.includes(selectedAssay)) {
      setSelectedAssay("ALL");
    }
  }, [csvData]);

  // Build Target list whenever csvData or selectedAssay changes
  useEffect(() => {
    if (!csvData?.length) {
      setTargets(["ALL"]);
      setSelectedTarget("ALL");
      return;
    }

    const rows = csvData.filter((r) => {
      const assay = (r["Assay"] ?? "").toString().trim().toUpperCase();
      if (selectedAssay === "ALL") return Boolean(assay);
      return assay === selectedAssay;
    });

    const uniqueTargets = Array.from(
      new Set(
        rows
          .map((r) => (r["Target"] ?? "").toString().trim().toUpperCase())
          .filter(Boolean)
      )
    ).sort();

    const nextTargets = ["ALL", ...uniqueTargets];
    setTargets(nextTargets);

    if (!nextTargets.includes(selectedTarget)) {
      setSelectedTarget("ALL");
    }
  }, [csvData, selectedAssay]);

  // Build heatmap grids whenever data / assay / target changes
  useEffect(() => {
    if (!csvData.length) return;

    const grid = Array.from({ length: GRID }, () => Array(GRID).fill(EMPTY));
    const hoverGrid = Array.from({ length: GRID }, () => Array(GRID).fill(""));

    csvData.forEach((row) => {
      const assayType = (row["Assay"] ?? "").toString().trim().toUpperCase();
      if (selectedAssay !== "ALL" && assayType !== selectedAssay) return;

      const target = (row["Target"] ?? "").toString().trim().toUpperCase();
      if (selectedTarget !== "ALL" && target !== selectedTarget) return;

      const ctRaw = row["Ct value"];
      const r = parseInt(row["Row.No"], 10);
      const c = parseInt(row["Column no"], 10);
      const sampleId = (row["Sample iD"] ?? "").toString();
      const well = row["Well no"];

      if (Number.isNaN(r) || Number.isNaN(c) || ctRaw == null) return;
      if (r < 0 || r >= GRID || c < 0 || c >= GRID) return;

      const isUndetermined =
        typeof ctRaw === "string" &&
        ctRaw.toString().trim().toUpperCase() === "UNDETERMINED";

      const value = isUndetermined ? 0 : parseFloat(ctRaw);
      if (Number.isNaN(value)) return;

      grid[r][c] = value;
      hoverGrid[r][c] =
        `<br>Assay: ${assayType}` +
        `<br>Target: ${target || "—"}` +
        `<br>Well Number: ${well ?? "—"}` +
        `<br>Sample ID: ${sampleId || "—"}` +
        `<br>Ct: ${isUndetermined ? "Undetermined (plotted as 0)" : value}`;
    });

    setZData(grid);
    setTextData(hoverGrid);
  }, [csvData, selectedAssay, selectedTarget]);

  const createCustomColorscale = () => {
    const mins = colorRanges.map((r) => r.min);
    const maxs = colorRanges.map((r) => r.max);
    const zminLocal = Math.min(...mins);
    const zmaxLocal = Math.max(...maxs);

    if (!isFinite(zminLocal) || !isFinite(zmaxLocal)) {
      return [["0", "#ffffff"], ["1", "#ffffff"]];
    }
    // avoid divide-by-zero if zmin === zmax
    const span = zmaxLocal - zminLocal || 1;

    return colorRanges.flatMap((r) => [
      [(r.min - zminLocal) / span, r.color],
      [(r.max - zminLocal) / span, r.color],
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