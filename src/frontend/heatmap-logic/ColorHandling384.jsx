import React from "react";
import { SketchPicker } from "react-color";
import { Button, Card, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const ColorHandling384 = ({ colorRanges, setColorRanges }) => {
  // Handle color change
  const handleColorChange = (newColor, index) => {
    const updated = [...colorRanges];
    updated[index].color = newColor.hex.toUpperCase(); 
    setColorRanges(updated);
  };

  // Min/max change
  const handleRangeChange = (field, value, index) => {
    const updated = [...colorRanges];
    updated[index][field] = typeof value === "number" ? value : 0;
    setColorRanges(updated);
  };

  // Add a new color range
  const addColorRange = () => {
    setColorRanges([
      ...colorRanges,
      { color: "#00FF00", min: 0, max: 10 },
    ]);
  };

  // Remove a color range
  const removeColorRange = (index) => {
    // Allow removing everything except the hidden -1 range
    const visibleRanges = colorRanges.filter(
      (r) => !(r.min === -1 && r.max === -1)
    );
    if (visibleRanges.length <= 1) {
      alert("At least one visible color range is required.");
      return;
    }
    setColorRanges(colorRanges.filter((_, i) => i !== index));
  };

  return (
    <div style={{ marginBottom: 20 }}>
      {colorRanges.map((range, index) => {
        // 🔹 Hide the -1/-1 range in the UI
        if (range.min === -1 && range.max === -1) return null;

        return (
          <Card
            key={index}
            size="small"
            style={{
              display: "inline-block",
              margin: 10,
              padding: 10,
              textAlign: "center",
            }}
          >
            <SketchPicker
              color={{ hex: range.color }}
              onChangeComplete={(newColor) => handleColorChange(newColor, index)}
            />

            <div style={{ marginTop: 10 }}>
              <div style={{ marginBottom: 5 }}>
                <span>Min:</span>
                <InputNumber
                  min={0}
                  max={50}
                  step={0.001}
                  precision={3}
                  value={range.min}
                  onChange={(val) => handleRangeChange("min", val, index)}
                  style={{ marginTop: 5, width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: 5 }}>
                <span>Max:</span>
                <InputNumber
                  min={0}
                  max={50}
                  step={0.001}
                  precision={3}
                  value={range.max}
                  onChange={(val) => handleRangeChange("max", val, index)}
                  style={{ marginTop: 5, width: "100%" }}
                />
              </div>

              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeColorRange(index)}
                style={{ marginTop: 5 }}
              >
                Remove
              </Button>
            </div>
          </Card>
        );
      })}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addColorRange}
        style={{ marginTop: 10 }}
      >
        Add Color Range
      </Button>
    </div>
  );
};

export default ColorHandling384;
