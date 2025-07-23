import React from "react";
import { SketchPicker } from "react-color";
import { Button, Card, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const ColorHandling = ({ colorRanges, setColorRanges }) => {
  // Change color for a specific range
  const handleColorChange = (newColor, index) => {
    const updated = [...colorRanges];
    updated[index].color = newColor.hex;
    setColorRanges(updated);
  };

  // Change min/max values
  const handleRangeChange = (field, value, index) => {
    const updated = [...colorRanges];
    updated[index][field] = value || 0;
    setColorRanges(updated);
  };

  // Add a new range
  const addColorRange = () => {
    setColorRanges([
      ...colorRanges,
      { color: "#00ff00", min: 0, max: 10 },
    ]);
  };

  // Remove a range
  const removeColorRange = (index) => {
    if (colorRanges.length > 1) {
      setColorRanges(colorRanges.filter((_, i) => i !== index));
    } else {
      alert("At least one color range is required.");
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      {colorRanges.map((range, index) => (
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
            color={range.color}
            onChangeComplete={(newColor) =>
              handleColorChange(newColor, index)
            }
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
                onChange={(val) =>
                  handleRangeChange("min", val, index)
                }
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
                onChange={(val) =>
                  handleRangeChange("max", val, index)
                }
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
      ))}

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

export default ColorHandling;
