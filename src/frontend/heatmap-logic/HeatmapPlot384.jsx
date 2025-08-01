// import React, { useEffect, useState } from "react";
// import Plot from "react-plotly.js";
// import Papa from "papaparse";
// import { Button } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import ColorHandling from "./ColorHandling";
// import TargetFilter384 from "./TargetFilter384";
// import SampleTypePieChart from "./PiChart";

// const HeatmapPlot = () => {
//   const [zData, setZData] = useState(Array.from({ length: 72 }, () => Array(72).fill(-1)));
//   const [textData, setTextData] = useState(Array.from({ length: 72 }, () => Array(72).fill("")));
//   const [colorRanges, setColorRanges] = useState([
//     // { color: "#ffffff", min: -1, max: -1 },
//     { color: "#ffffff", min: 0, max: 10 },
//   ]);
//   const [selectedTarget, setSelectedTarget] = useState("ALL");
//   const [csvData, setCsvData] = useState([]);
//   const [wellPositionMap, setWellPositionMap] = useState({});

//   useEffect(() => {
//     fetch("/384position_map.json")
//       .then((res) => res.json())
//       .then((data) => setWellPositionMap(data));
//   }, []);

//   const handleCSVUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         setCsvData(results.data);
//       },
//     });
//   };

//   useEffect(() => {
//     if (!csvData.length) return;

//     const EMPTY_VAL = -1;
//     const grid = Array.from({ length: 72 }, () => Array(72).fill(EMPTY_VAL));

//     // const grid = Array.from({ length: 72 }, () => Array(72).fill(null));
//     const hoverGrid = Array.from({ length: 72 }, () => Array(72).fill(""));

//     csvData.forEach((row) => {
//       const well = row["Well no"];
//       const ctRaw = row["Ct value"];
//       const target = row["Target"]?.toString().trim().toUpperCase();
//       const row_id = parseInt(row["Row.No"]);
//       const col_id = parseInt(row["Column no"]);
//       const sampleId = row["Sample iD"];

//       if (!well || ctRaw === undefined || isNaN(row_id) || isNaN(col_id)) return;
//       if (selectedTarget !== "ALL" && target !== selectedTarget) return;

//       const value = ctRaw.toString().trim().toUpperCase() === "UNDETERMINED" ? 0 : parseFloat(ctRaw);

//       if (!isNaN(value)) {
//         grid[row_id][col_id] = value;
//         hoverGrid[row_id][col_id] = `Well: ${well}<br>Sample ID: ${sampleId}<br>Ct: ${value}<br>Row: ${row_id}<br>Column: ${col_id}`;
//       } else {
//         grid[row_id][col_id] = EMPTY_VAL;
//         hoverGrid[row_id][col_id] = `Well: ${well}<br>Sample ID: ${sampleId}<br>No Ct Value`;
//       }

//     });

//     setZData(grid);
//     setTextData(hoverGrid);
//   }, [csvData, selectedTarget]);

//   const createCustomColorscale = () => {
//     const zmin = Math.min(...colorRanges.map((r) => r.min));
//     const zmax = Math.max(...colorRanges.map((r) => r.max));
//     return colorRanges.flatMap((r) => [
//       [(r.min - zmin) / (zmax - zmin), r.color],
//       [(r.max - zmin) / (zmax - zmin), r.color],
//     ]);
//   };

//   const zmin = Math.min(...colorRanges.map((r) => r.min));
//   const zmax = Math.max(...colorRanges.map((r) => r.max));

//   const blockHeight = 16;
//   const blockWidth = 24;
//   const gridSize = 72;

//   const borders = [];
//   for (let row = 0; row < gridSize; row += blockHeight) {
//     for (let col = 0; col < gridSize; col += blockWidth) {
//       borders.push({
//         type: 'rect',
//         xref: 'x',
//         yref: 'y',
//         x0: col - 0.5,
//         y0: row - 0.5,
//         x1: col + blockWidth - 0.5,
//         y1: row + blockHeight - 0.5,
//         line: {
//           color: 'black',
//           width: 1.5
//         },
//         fillcolor: 'rgba(0,0,0,0)' // transparent
//       });
//     }
//   }

//   return (
//     <div style={{ textAlign: "center", padding: 5 }}>
//       <h2>384 Well Plate Heatmap</h2>

//       <div style={{ marginBottom: 20 }}>
//         <TargetFilter384 selectedTarget={selectedTarget} setSelectedTarget={setSelectedTarget} />
//         <input
//           type="file"
//           accept=".csv"
//           id="csv-upload"
//           style={{ display: "none" }}
//           onChange={handleCSVUpload}
//         />
//         <Button icon={<UploadOutlined />} onClick={() => document.getElementById("csv-upload").click()}>
//           Upload CSV
//         </Button>
//       </div>

//       <ColorHandling colorRanges={colorRanges} setColorRanges={setColorRanges} />

//       <Plot
//         data={[
//           {
//             z: zData,
//             text: textData,
//             hoverinfo: "text",
//             hovertemplate: "%{text}<extra></extra>",
//             type: "heatmap",
//             colorscale: createCustomColorscale(),
//             showscale: true,
//             zmin: zmin,
//             zmax: zmax,
//             xgap: 0.3,
//             ygap: 0.3,
//           },
//         ]}
//         layout={{
//           width: 800,
//           height: 800,
//           title: `384-Well Plate Heatmap - ${selectedTarget}`,
//           plot_bgcolor: "#000000",
//           xaxis: {
//             title: "Column",
//             showgrid: true,
//             gridcolor: "#ccc",
//             zeroline: false,
//           },
//           yaxis: {
//             title: "Row",
//             autorange: "reversed",
//             showgrid: true,
//             gridcolor: "#ccc",
//             zeroline: false,
//           },
//           margin: { t: 50, b: 50, l: 50, r: 50 },
//           shapes: borders
//         }}
//       />
//       <SampleTypePieChart csvData={csvData} />
//     </div>
//   );
// };

// export default HeatmapPlot;

import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ColorHandling from "./ColorHandling";
import TargetFilter384 from "./TargetFilter384";
import SampleTypePieChart from "./PiChart";

const HeatmapPlot = () => {
  const gridRows = 63;
  const gridCols = 72;

  const [zData, setZData] = useState(
    Array.from({ length: gridRows }, () => Array(gridCols).fill(-1))
  );
  const [textData, setTextData] = useState(
    Array.from({ length: gridRows }, () => Array(gridCols).fill(""))
  );
  const [colorRanges, setColorRanges] = useState([
    { color: "#ffffff", min: 0, max: 10 },
  ]);
  const [selectedTarget, setSelectedTarget] = useState("ALL");
  const [csvData, setCsvData] = useState([]);
  const [wellPositionMap, setWellPositionMap] = useState({});

  useEffect(() => {
    fetch("/384position_map.json")
      .then((res) => res.json())
      .then((data) => setWellPositionMap(data));
  }, []);

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  useEffect(() => {
    if (!csvData.length) return;

    const EMPTY_VAL = -1;
    const grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(EMPTY_VAL));
    const hoverGrid = Array.from({ length: gridRows }, () => Array(gridCols).fill(""));

    csvData.forEach((row) => {
      const well = row["Well no"];
      const ctRaw = row["Ct value"];
      const target = row["Target"]?.toString().trim().toUpperCase();
      const row_id = parseInt(row["Row.No"]);
      const col_id = parseInt(row["Column no"]);
      const sampleId = row["Sample iD"];

      if (!well || ctRaw === undefined || isNaN(row_id) || isNaN(col_id)) return;
      if (row_id >= gridRows || col_id >= gridCols) return; // Ignore beyond 63×72
      if (selectedTarget !== "ALL" && target !== selectedTarget) return;

      const value =
        ctRaw.toString().trim().toUpperCase() === "UNDETERMINED" ? 0 : parseFloat(ctRaw);

      if (!isNaN(value)) {
        grid[row_id][col_id] = value;
        hoverGrid[row_id][col_id] = `Well: ${well}<br>Sample ID: ${sampleId}<br>Ct: ${value}<br>Row: ${row_id}<br>Column: ${col_id}`;
      } else {
        grid[row_id][col_id] = EMPTY_VAL;
        hoverGrid[row_id][col_id] = `Well: ${well}<br>Sample ID: ${sampleId}<br>No Ct Value`;
      }
    });

    setZData(grid);
    setTextData(hoverGrid);
  }, [csvData, selectedTarget]);

  // Function to insert NaN gaps for spacing every 16 rows and 24 columns
  const insertGapsIntoGrid = (originalGrid, gapRowEvery = 16, gapColEvery = 24, fillValue = NaN) => {
    const rows = originalGrid.length;
    const cols = originalGrid[0].length;
    const newGrid = [];

    for (let r = 0; r < rows; r++) {
      const newRow = [];
      for (let c = 0; c < cols; c++) {
        newRow.push(originalGrid[r][c]);

        // Insert gap column after every 24th col, except last
        if ((c + 1) % gapColEvery === 0 && c !== cols - 1) {
          newRow.push(fillValue);
        }
      }

      newGrid.push(newRow);

      // Insert gap row after every 16th row, except last
      if ((r + 1) % gapRowEvery === 0 && r !== rows - 1) {
        newGrid.push(Array(newRow.length).fill(fillValue));
      }
    }

    return newGrid;
  };

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

  // Create processed data with gaps
  const processedZ = insertGapsIntoGrid(zData, 16, 24, NaN);
  const processedText = insertGapsIntoGrid(textData, 16, 24, "");

  // Borders: match new grid with gaps
  const borders = [];
  const blockHeight = 16;
  const blockWidth = 24;
  let adjustedRows = processedZ.length;
  let adjustedCols = processedZ[0].length;

  for (let row = 0; row < adjustedRows; row++) {
    for (let col = 0; col < adjustedCols; col++) {
      // Draw rectangle borders around actual 16×24 blocks
      if (
        row % (blockHeight + 1) === 0 &&
        col % (blockWidth + 1) === 0 &&
        row + blockHeight <= adjustedRows &&
        col + blockWidth <= adjustedCols
      ) {
        borders.push({
          type: "rect",
          xref: "x",
          yref: "y",
          x0: col - 0.5,
          y0: row - 0.5,
          x1: col + blockWidth - 0.5,
          y1: row + blockHeight - 0.5,
          line: {
            color: "black",
            width: 1.5,
          },
          fillcolor: "rgba(0,0,0,0)", // transparent
        });
      }
    }
  }

  return (
    <div style={{ textAlign: "center", padding: 5 }}>
      <h2>384 Well Plate Heatmap</h2>

      <div style={{ marginBottom: 20 }}>
        <TargetFilter384 selectedTarget={selectedTarget} setSelectedTarget={setSelectedTarget} />
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
      </div>

      <ColorHandling colorRanges={colorRanges} setColorRanges={setColorRanges} />

      <Plot
        data={[
          {
            z: processedZ,
            text: processedText,
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
          title: `384-Well Plate Heatmap - ${selectedTarget}`,
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
          margin: { t: 50, b: 50, l: 50, r: 50 },
          shapes: borders,
        }}
      />

      <SampleTypePieChart csvData={csvData} />
    </div>
  );
};

export default HeatmapPlot;
