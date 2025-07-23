import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { Button } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const ColorPickerUI = ({ onColorsChange }) => {
  const [colors, setColors] = useState(["#0000ff", "#ff0000"]); // Default: Blue to Red

  // Handle color change
  const handleColorChange = (color, index) => {
    const updatedColors = [...colors];
    updatedColors[index] = color.hex;
    setColors(updatedColors);
    onColorsChange(updatedColors);
  };

  // Add new color
  const addColor = () => {
    setColors([...colors, "#00ff00"]); // Add green by default
    onColorsChange([...colors, "#00ff00"]);
  };

  // Remove color
  const removeColor = (index) => {
    if (colors.length > 2) {
      const updatedColors = colors.filter((_, i) => i !== index);
      setColors(updatedColors);
      onColorsChange(updatedColors);
    } else {
      alert("At least 2 colors are required.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Customize Heatmap Colors</h3>
      {colors.map((color, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 10,
            gap: "10px",
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
          >
            Remove
          </Button>
        </div>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} onClick={addColor}>
        Add Color
      </Button>
    </div>
  );
};

export default ColorPickerUI;
