import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button, message, Tag } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ColorHandling from "./ColorHandling384";
import TargetFilter from "./TargetFilter";
import SampleTypePieChart from "./PiChart";

const HeatmapPlotSmartchip = () => {
  const [zData, setZData] = useState(Array.from({ length: 72 }, () => Array(72).fill(0)));
  const [textData, setTextData] = useState(Array.from({ length: 72 }, () => Array(72).fill("")));
  const [colorRanges, setColorRanges] = useState([
    { color: "#ffffff", min: -1, max: -1 }
  ]);
  const [selectedTarget, setSelectedTarget] = useState("ALL");
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setFileName(file.name); // store filename
        message.success(`File "${file.name}" uploaded successfully`);
      },
    });
  };

  useEffect(() => {
    if (!csvData.length) return;

    const EMPTY = -1;  // sentinel value for empty
    const grid = Array.from({ length: 72 }, () => Array(72).fill(EMPTY));

    // const grid = Array.from({ length: 72 }, () => Array(72).fill(null));
    const hoverGrid = Array.from({ length: 72 }, () => Array(72).fill(""));

    csvData.forEach((row) => {
      const assayType = row["Assay"]?.toString().trim().toUpperCase();
      if (assayType !== "PRRSV") return;

      const target = row["Target"]?.toString().trim().toUpperCase();
      if (selectedTarget !== "ALL" && target !== selectedTarget) return;

      const ctRaw = row["Ct value"];
      const rowNo = parseInt(row["Row.No"]);
      const colNo = parseInt(row["Column no"]);
      const sampleId = row["Sample iD"];

      if (isNaN(rowNo) || isNaN(colNo) || ctRaw === undefined) return;

      const value = ctRaw.toString().trim().toUpperCase() === "UNDETERMINED" ? 0 : parseFloat(ctRaw);
      if (!isNaN(value)) {
        grid[rowNo][colNo] = value;
        hoverGrid[rowNo][colNo] = `<br>Sample ID: ${sampleId}<br>Ct: ${value}`;
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
            zmin: zmin,
            zmax: zmax,
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
          // margin: { t: 50, b: 50, l: 50, r: 50 },
          // shapes: borders
        }}
      />
      <SampleTypePieChart csvData={csvData} />
    </div>
  );
};

export default HeatmapPlotSmartchip;