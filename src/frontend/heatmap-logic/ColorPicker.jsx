import React, { useState } from "react";
import Plot from "react-plotly.js";
import { SketchPicker } from "react-color";
import { InputNumber } from "antd";

const HeatmapWithColorPicker = () => {
  // Dummy CT data
  const [zData] = useState([
    [25.123, 26.456, 27.789],
    [28.456, 24.987, 29.321],
    [30.123, 28.654, 27.432],
  ]);

  const [minCT, setMinCT] = useState(24.0);
  const [maxCT, setMaxCT] = useState(31.0);

  // Color Picker State
  const [startColor, setStartColor] = useState("#0000ff"); // Blue
  const [endColor, setEndColor] = useState("#ff0000"); // Red

  return (
    <div style={{ padding: 20 }}>
      <h2>CT Heatmap</h2>

      {/* CT Range Control */}
      <div style={{ marginBottom: 20 }}>
        <span>CT Min:</span>
        <InputNumber
          min={0}
          max={50}
          step={0.001}
          precision={3}  // Allows up to 3 decimal places
          value={minCT}
          onChange={(value) => setMinCT(Number(value.toFixed(3)))}
          style={{ margin: "0 10px" }}
        />
        <span>CT Max:</span>
        <InputNumber
          min={0}
          max={50}
          step={0.001}
          precision={3}  // Allows up to 3 decimal places
          value={maxCT}
          onChange={(value) => setMaxCT(Number(value.toFixed(3)))}
          style={{ margin: "0 10px" }}
        />
      </div>

      {/* Color Pickers */}
      <div style={{ display: "flex", gap: "20px", marginBottom: 20 }}>
        <div>
          <p>Start Color</p>
          <SketchPicker
            color={startColor}
            onChangeComplete={(color) => setStartColor(color.hex)}
          />
        </div>
        <div>
          <p>End Color</p>
          <SketchPicker
            color={endColor}
            onChangeComplete={(color) => setEndColor(color.hex)}
          />
        </div>
      </div>

      {/* Plotly Heatmap */}
      <Plot
        data={[
          {
            z: zData,
            type: "heatmap",
            colorscale: [
              [0, startColor],
              [1, endColor],
            ],
            zmin: minCT,
            zmax: maxCT,
          },
        ]}
        layout={{
          width: 500,
          height: 500,
          margin: { t: 50, b: 50 },
          title: "CT Value Heatmap",
        }}
      />
    </div>
  );
};

export default HeatmapWithColorPicker;
