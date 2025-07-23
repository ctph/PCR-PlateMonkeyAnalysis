import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button, InputNumber, message } from "antd";
import { UploadOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { SketchPicker } from "react-color";

// Helper function for custom colorscale
const createCustomColorscale = (ranges, dataMin, dataMax) => {
  if (ranges.length === 0) return [[0, "white"], [1, "black"]];
  
  const sortedRanges = [...ranges].sort((a, b) => a.min - b.min);
  let scale = [];
  
  // Normalize helper function
  const normalize = (value) => {
    const range = dataMax - dataMin;
    return range > 0 ? (value - dataMin) / range : 0.5;
  };

  // Add initial segment if needed
  if (sortedRanges[0].min > dataMin) {
    scale.push([0, "white"]);
    scale.push([normalize(sortedRanges[0].min), "white"]);
  }

  // Add each range
  sortedRanges.forEach((range) => {
    scale.push([normalize(range.min), range.color]);
    scale.push([normalize(range.max), range.color]);
  });

  // Add final segment if needed
  const lastRange = sortedRanges[sortedRanges.length-1];
  if (lastRange.max < dataMax) {
    scale.push([normalize(lastRange.max), lastRange.color]);
    scale.push([1, lastRange.color]);
  }

  return scale;
};

const ColorHandling = ({ colorRanges, setColorRanges, dataMin, dataMax }) => {
  const updateColor = (newColor, index) => {
    const updated = [...colorRanges];
    updated[index].color = newColor.hex;
    setColorRanges(updated);
  };

  const updateRange = (key, value, index) => {
    const updated = [...colorRanges];
    const numValue = value ?? 0;
    
    // Ensure value stays within data bounds
    const clampedValue = Math.max(dataMin, Math.min(dataMax, numValue));
    updated[index][key] = clampedValue;
    
    // Ensure min <= max
    if (key === 'min' && clampedValue > updated[index].max) {
      updated[index].max = clampedValue;
    } else if (key === 'max' && clampedValue < updated[index].min) {
      updated[index].min = clampedValue;
    }
    
    setColorRanges(updated);
  };

  const addColorRange = () => {
    if (colorRanges.length === 0) {
      setColorRanges([{ color: "#00ff00", min: dataMin, max: dataMax }]);
      return;
    }
    
    // Add new range in the middle of the last range
    const lastRange = colorRanges[colorRanges.length - 1];
    const rangeSize = lastRange.max - lastRange.min;
    const newMin = lastRange.min + rangeSize * 0.3;
    const newMax = lastRange.min + rangeSize * 0.7;
    
    setColorRanges([
      ...colorRanges,
      { color: `#${Math.floor(Math.random()*16777215).toString(16)}`, 
        min: newMin, 
        max: newMax }
    ]);
  };

  const removeColorRange = (index) => {
    if (colorRanges.length <= 1) {
      message.warning("At least one color range must remain");
      return;
    }
    setColorRanges(colorRanges.filter((_, i) => i !== index));
  };

  const resetColorRanges = () => {
    const midPoint = dataMin + (dataMax - dataMin) / 2;
    setColorRanges([
      { color: "#0000ff", min: dataMin, max: midPoint },
      { color: "#ff0000", min: midPoint, max: dataMax }
    ]);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: "20px", 
        flexWrap: "wrap",
        marginBottom: "10px"
      }}>
        {colorRanges.map((range, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <SketchPicker
              color={range.color}
              onChangeComplete={(newColor) => updateColor(newColor, index)}
              width="200px"
            />
            <div style={{ marginTop: "10px" }}>
              <span>Min:</span>
              <InputNumber
                min={dataMin}
                max={dataMax}
                step={0.1}
                value={range.min}
                onChange={(val) => updateRange("min", val, index)}
                style={{ width: "80px", margin: "0 5px" }}
              />
              <span>Max:</span>
              <InputNumber
                min={dataMin}
                max={dataMax}
                step={0.1}
                value={range.max}
                onChange={(val) => updateRange("max", val, index)}
                style={{ width: "80px", margin: "0 5px" }}
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeColorRange(index)}
                style={{ marginTop: "5px" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addColorRange}
        >
          Add Color Range
        </Button>
        <Button
          type="default"
          onClick={resetColorRanges}
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

const HeatmapPlot = () => {
  const [zData, setZData] = useState(
    Array.from({ length: 8 }, () => Array(12).fill(null))
  );
  const [colorRanges, setColorRanges] = useState([]);
  
  // Calculate data min/max
  const allValues = zData.flat().filter(val => val !== null);
  const dataMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const dataMax = allValues.length > 0 ? Math.max(...allValues) : 1;

  // Initialize default color ranges when data loads
  useEffect(() => {
    if (allValues.length > 0 && colorRanges.length === 0) {
      const midPoint = dataMin + (dataMax - dataMin) / 2;
      setColorRanges([
        { color: "#0000ff", min: dataMin, max: midPoint },
        { color: "#ff0000", min: midPoint, max: dataMax }
      ]);
    }
  }, [zData]);

  const xLabels = Array.from({ length: 12 }, (_, i) => i + 1);
  const yLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const grid = Array.from({ length: 8 }, () => Array(12).fill(null));
        results.data.forEach((row) => {
          const well = row["Well no"] || row["Well No"] || row["Well"];
          const ctValue = row["Ct value"] || row["Ct Value"];
          if (well && ctValue !== undefined) {
            const rowLetter = well.charAt(0).toUpperCase();
            const colNumber = parseInt(well.slice(1), 10);
            const rowIndex = rowLetter.charCodeAt(0) - "A".charCodeAt(0);
            const colIndex = colNumber - 1;
            if (rowIndex >= 0 && rowIndex < 8 && colIndex >= 0 && colIndex < 12) {
              const parsedCT = ctValue.trim().toUpperCase() === "UNDETERMINED"
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

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>CT Value Heatmap</h2>

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
          style={{ marginRight: 10 }}
        >
          Upload CSV
        </Button>
      </div>

      <ColorHandling 
        colorRanges={colorRanges} 
        setColorRanges={setColorRanges}
        dataMin={dataMin}
        dataMax={dataMax}
      />

      <Plot
        data={[
          {
            z: zData,
            x: xLabels,
            y: yLabels,
            type: "heatmap",
            colorscale: createCustomColorscale(colorRanges, dataMin, dataMax),
            zmin: dataMin,
            zmax: dataMax,
            showscale: true,
            hoverongaps: false,
            hovertemplate: 'Row %{y}, Col %{x}<br>CT Value: %{z}<extra></extra>'
          },
        ]}
        layout={{
          width: 800,
          height: 600,
          title: `CT Values (Range: ${dataMin.toFixed(2)} - ${dataMax.toFixed(2)})`,
          margin: { t: 80, b: 50, l: 50, r: 50 },
          xaxis: { 
            title: "Column", 
            side: "top",
            tickmode: "array",
            tickvals: xLabels
          },
          yaxis: { 
            title: "Row", 
            autorange: "reversed",
            tickmode: "array",
            tickvals: yLabels
          },
        }}
        config={{ responsive: true }}
      />
    </div>
  );
};

export default HeatmapPlot;