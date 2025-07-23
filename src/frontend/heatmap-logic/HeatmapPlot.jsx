import React, { useState } from "react";
import Plot from "react-plotly.js";
import { SketchPicker } from "react-color";
import { Button } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const HeatmapPlot = () => {
  // Sample dummy data for heatmap
  const [zData] = useState([
    [25.123, 26.456, 27.789],
    [28.456, 24.987, 29.321],
    [30.123, 28.654, 27.432],
  ]);

  // Default colors
  const [colors, setColors] = useState(["#0000ff", "#ff0000"]);
  const [minCT, setMinCT] = useState(24.0);
  const [maxCT, setMaxCT] = useState(31.0);

  const handleColorChange = (newColor, index) => {
    const updatedColors = [...colors];
    updatedColors[index] = newColor.hex;
    setColors(updatedColors);
  };

  const addColor = () => {
    setColors([...colors, "#00ff00"]); // Add green by default
  };

  const removeColor = (index) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    } else {
      alert("At least 2 colors are required.");
    }
  };

  // Convert colors to Plotly's colorscale format
  const colorscale = colors.map((c, i) => [i / (colors.length - 1), c]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>CT Heatmap</h2>

      {/* Color Pickers */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {colors.map((color, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <SketchPicker
              color={color}
              onChangeComplete={(newColor) =>
                handleColorChange(newColor, index)
              }
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              style={{ marginTop: 10 }}
              onClick={() => removeColor(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addColor}
          style={{ height: 40, marginTop: 60 }}
        >
          Add Color
        </Button>
      </div>

      {/* Plotly Heatmap */}
      <Plot
        data={[
          {
            z: zData,
            type: "heatmap",
            colorscale: colorscale,
            zmin: minCT,
            zmax: maxCT,
          },
        ]}
        layout={{
          width: 600,
          height: 600,
          title: "CT Value Heatmap",
          margin: { t: 50, b: 50, l: 50, r: 50 },
        }}
      />
    </div>
  );
};

export default HeatmapPlot;
