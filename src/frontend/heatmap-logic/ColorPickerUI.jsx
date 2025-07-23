import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { Button, Card } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const ColorPickerUI = ({ onColorsChange }) => {
  const [colors, setColors] = useState(["#0000ff", "#ff0000"]);

  const handleColorChange = (color, index) => {
    const updatedColors = [...colors];
    updatedColors[index] = color.hex;
    setColors(updatedColors);
    onColorsChange(updatedColors);
  };

  const addColor = () => {
    const updated = [...colors, "#00ff00"];
    setColors(updated);
    onColorsChange(updated);
  };

  const removeColor = (index) => {
    if (colors.length > 2) {
      const updated = colors.filter((_, i) => i !== index);
      setColors(updated);
      onColorsChange(updated);
    } else {
      alert("At least 2 colors are required.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Customize Heatmap Colors</h3>

      {/* Gradient Preview */}
      <div
        style={{
          height: "20px",
          width: "100%",
          background: `linear-gradient(to right, ${colors.join(", ")})`,
          marginBottom: "15px",
          borderRadius: "5px",
        }}
      />

      {colors.map((color, index) => (
        <Card
          key={index}
          size="small"
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 10,
            padding: "10px",
          }}
        >
          <SketchPicker
            color={color}
            onChangeComplete={(newColor) => handleColorChange(newColor, index)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeColor(index)}
            style={{ marginLeft: "10px" }}
          >
            Remove
          </Button>
        </Card>
      ))}

      <Button type="dashed" icon={<PlusOutlined />} onClick={addColor}>
        Add Color
      </Button>
    </div>
  );
};

export default ColorPickerUI;
