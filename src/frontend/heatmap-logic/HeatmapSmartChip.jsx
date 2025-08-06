import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button } from "antd";
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

// const blockHeight = 8;
//   const blockWidth = 12;
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


  return (
    <div style={{ textAlign: "center", padding: 5 }}>
      <h2>SmartChip PRRSV Heatmap</h2>

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


// import React, { useState, useEffect } from "react";
// import Plot from "react-plotly.js";
// import Papa from "papaparse";
// import { Button } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import ColorHandling from "./ColorHandling";
// import TargetFilter from "./TargetFilter";
// import SampleTypePieChart from "./PiChart";

// const HeatmapPlotSmartchip = () => {
//   const GRID_SIZE = 72;
//   const [zData, setZData] = useState(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(NaN)));
//   const [textData, setTextData] = useState(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill("")));
//   const [colorRanges, setColorRanges] = useState([]);
//   const [selectedTarget, setSelectedTarget] = useState("ALL");
//   const [csvData, setCsvData] = useState([]);

//   /** ---------------- CSV UPLOAD ---------------- */
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

//   /** ---------------- PROCESS CSV ---------------- */
//   useEffect(() => {
//     if (!csvData.length) return;

//     const EMPTY = NaN;
//     const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(EMPTY));
//     const hoverGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));

//     csvData.forEach((row) => {
//       const assayType = row["Assay"]?.toString().trim().toUpperCase();
//       if (assayType !== "PRRSV") return;

//       const target = row["Target"]?.toString().trim().toUpperCase();
//       if (selectedTarget !== "ALL" && target !== selectedTarget) return;

//       const ctRaw = row["Ct value"];
//       const rowNo = parseInt(row["Row.No"]);
//       const colNo = parseInt(row["Column no"]);
//       const sampleId = row["Sample iD"];

//       if (isNaN(rowNo) || isNaN(colNo) || !ctRaw || ctRaw.trim() === "") return;

//       const value =
//         ctRaw.toString().trim().toUpperCase() === "UNDETERMINED"
//           ? NaN
//           : parseFloat(ctRaw);

//       if (!isNaN(value)) {
//         grid[rowNo][colNo] = value;
//         hoverGrid[rowNo][colNo] = `<br>Sample ID: ${sampleId}<br>Ct: ${value}`;
//       }
//     });

//     setZData(grid);
//     setTextData(hoverGrid);
//   }, [csvData, selectedTarget]);

//   /** ---------------- CUSTOM COLOR SCALE ---------------- */
//   const createCustomColorscale = () => {
//     if (!colorRanges.length) return [];
//     const zmin = Math.min(...colorRanges.map((r) => r.min));
//     const zmax = Math.max(...colorRanges.map((r) => r.max));
//     return colorRanges.flatMap((r) => [
//       [(r.min - zmin) / (zmax - zmin), r.color],
//       [(r.max - zmin) / (zmax - zmin), r.color],
//     ]);
//   };

//   const zmin = colorRanges.length ? Math.min(...colorRanges.map((r) => r.min)) : 0;
//   const zmax = colorRanges.length ? Math.max(...colorRanges.map((r) => r.max)) : 1;

//   /** ---------------- CREATE GPU BORDER TRACE ---------------- */
//   const createBorderTrace = (rows, cols) => {
//     const borderX = [];
//     const borderY = [];

//     // Horizontal lines (y edges)
//     for (let r = 0; r <= rows; r++) {
//       borderX.push(0, cols, null);
//       borderY.push(r, r, null);
//     }

//     // Vertical lines (x edges)
//     for (let c = 0; c <= cols; c++) {
//       borderX.push(c, c, null);
//       borderY.push(0, rows, null);
//     }

//     return {
//       x: borderX,
//       y: borderY,
//       mode: "lines",
//       type: "scattergl", // GPU accelerated
//       line: { color: "black", width: 1 },
//       hoverinfo: "skip",
//       showlegend: false,
//     };
//   };

//   const borderTrace = createBorderTrace(GRID_SIZE, GRID_SIZE);

//   /** ---------------- RENDER ---------------- */
//   return (
//     <div style={{ textAlign: "center", padding: 5 }}>
//       <h2>SmartChip PRRSV Heatmap</h2>

//       <div style={{ marginBottom: 20 }}>
//         <TargetFilter selectedTarget={selectedTarget} setSelectedTarget={setSelectedTarget} />
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
//             x: Array.from({ length: GRID_SIZE }, (_, i) => i + 0.5), // centers heatmap cells
//             y: Array.from({ length: GRID_SIZE }, (_, i) => i + 0.5),
//             text: textData,
//             hoverinfo: "text",
//             hovertemplate: "%{text}<extra></extra>",
//             type: "heatmap",
//             colorscale: createCustomColorscale(),
//             showscale: true,
//             zmin: zmin,
//             zmax: zmax,
//             xgap: 0,
//             ygap: 0,
//             zauto: false,
//             zsmooth: false,
//             coloraxis: "coloraxis",
//           },
//           borderTrace, // GPU-accelerated borders
//         ]}
//         layout={{
//           width: 800,
//           height: 800,
//           title: `SmartChip Heatmap - ${selectedTarget}`,
//           plot_bgcolor: "#ffffff",
//           paper_bgcolor: "#ffffff",
//           xaxis: { 
//             title: "Column", 
//             showgrid: false, 
//             zeroline: false,
//             range: [0, GRID_SIZE],
//             scaleanchor: "y" // keep squares
//           },
//           yaxis: { 
//             title: "Row", 
//             autorange: "reversed", 
//             showgrid: false, 
//             zeroline: false,
//             range: [0, GRID_SIZE]
//           },
//           coloraxis: {
//             cmin: zmin,
//             cmax: zmax,
//             colorscale: createCustomColorscale(),
//             showscale: true,
//             nanColor: "white", // Empty wells remain white
//           },
//         }}
//         config={{ responsive: true }}
//       />

//       <SampleTypePieChart csvData={csvData} />
//     </div>
//   );
// };

// export default HeatmapPlotSmartchip;
