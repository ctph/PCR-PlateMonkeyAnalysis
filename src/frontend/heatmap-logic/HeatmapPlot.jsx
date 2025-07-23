import React, { useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { SketchPicker } from "react-color";
import { Button, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";

const HeatmapPlot = () => {
  // 8x12 grid for 96-well plate
  const [zData, setZData] = useState(
    Array.from({ length: 8 }, () => Array(12).fill(null))
  );

  // Axis labels for wells
  const xLabels = Array.from({ length: 12 }, (_, i) => i + 1);
  const yLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  // Color stops (dynamic)
  const [colorStops, setColorStops] = useState([
    { color: "#0000ff", value: 0 },
    { color: "#ff0000", value: 40 },
  ]);

  // Handle CSV upload
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const grid = Array(8)
          .fill(null)
          .map(() => Array(12).fill(null));

        results.data.forEach((row, idx) => {
          const well = row["Well no"] || row["Well No"] || row["Well"];
          const ctValue = row["Ct value"] || row["Ct Value"];

          if (well && ctValue !== undefined) {
            const rowLetter = well.charAt(0).toUpperCase();
            const colNumber = parseInt(well.slice(1), 10);

            const rowIndex = rowLetter.charCodeAt(0) - "A".charCodeAt(0);
            const colIndex = colNumber - 1;

            if (rowIndex >= 0 && rowIndex < 8 && colIndex >= 0 && colIndex < 12) {
              const parsedCT =
                ctValue.trim().toUpperCase() === "UNDETERMINED"
                  ? 0
                  : parseFloat(ctValue);
              grid[rowIndex][colIndex] = parsedCT;
            }
          }
        });
        setZData(grid);
      },
    });
  };

  // Color stop management
  const updateColor = (newColor, index) => {
    const updated = [...colorStops];
    updated[index].color = newColor.hex;
    setColorStops(updated);
  };

  const updateValue = (value, index) => {
    const updated = [...colorStops];
    updated[index].value = value ?? 0;
    setColorStops(updated);
  };

  const addColorStop = () => {
    setColorStops([...colorStops, { color: "#00ff00", value: 20 }]);
  };

  const removeColorStop = (index) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter((_, i) => i !== index));
    } else {
      alert("At least 2 color stops required.");
    }
  };

  // Determine zmin & zmax based on color stops
  const minCT = Math.min(...colorStops.map((s) => s.value));
  const maxCT = Math.max(...colorStops.map((s) => s.value));

  // Generate Plotly colorscale
  const colorscale = colorStops
    .sort((a, b) => a.value - b.value)
    .map((stop) => [(stop.value - minCT) / (maxCT - minCT), stop.color]);

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>CT Heatmap (Dynamic)</h2>

      {/* Upload CSV */}
      <div style={{ marginBottom: 20 }}>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
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

      {/* Color Stops */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {colorStops.map((stop, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <SketchPicker
              color={stop.color}
              onChangeComplete={(newColor) => updateColor(newColor, index)}
            />
            <div style={{ marginTop: "10px" }}>
              <InputNumber
                min={0}
                max={100}
                step={0.001}
                precision={3}
                value={stop.value}
                onChange={(value) => updateValue(value, index)}
                style={{ width: "100px" }}
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                style={{ marginLeft: "5px" }}
                onClick={() => removeColorStop(index)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addColorStop}
          style={{ height: 40, marginTop: 60 }}
        >
          Add Color Stop
        </Button>
      </div>

      {/* Plotly Heatmap */}
      <Plot
        data={[
          {
            z: zData,
            x: xLabels,
            y: yLabels,
            type: "heatmap",
            colorscale: colorscale,
            zmin: minCT,
            zmax: maxCT,
            showscale: true,
          },
        ]}
        layout={{
          width: 800,
          height: 650,
          title: "CT Value Heatmap",
          margin: { t: 50, b: 50, l: 50, r: 50 },
          xaxis: { title: "Column", side: "top" },
          yaxis: { title: "Row", autorange: "reversed" },
        }}
      />
    </div>
  );
};

export default HeatmapPlot;
