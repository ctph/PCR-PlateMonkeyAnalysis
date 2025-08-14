// import React, { useEffect, useMemo, useState } from "react";
// import Plot from "react-plotly.js";
// import Papa from "papaparse";
// import { Button, message, Tag } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import ColorHandling384 from "./ColorHandling384";
// import TargetFilter from "./TargetFilter";
// import SampleTypePieChart from "./PiChart";

// const HeatmapPlot = () => {
//   const gridRows = 63;
//   const gridCols = 72;
//   const EMPTY_VAL = -1;

//   const [zData, setZData] = useState(
//     Array.from({ length: gridRows }, () => Array(gridCols).fill(EMPTY_VAL))
//   );
//   const [textData, setTextData] = useState(
//     Array.from({ length: gridRows }, () => Array(gridCols).fill(""))
//   );
//   const [colorRanges, setColorRanges] = useState([
//     { color: "#ffffff", min: -1, max: -1 },
//   ]);
//   const [selectedTarget, setSelectedTarget] = useState("ALL");
//   const [csvData, setCsvData] = useState([]);
//   const [wellPositionMap, setWellPositionMap] = useState({});
//   const [fileName, setFileName] = useState("");
  
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
//         setFileName(file.name); // store filename
//         message.success(`File "${file.name}" uploaded successfully`);
//       },
//     });
//   };

//   useEffect(() => {
//     if (!csvData.length) return;

//     const grid = Array.from({ length: gridRows }, () =>
//       Array(gridCols).fill(EMPTY_VAL)
//     );
//     const hoverGrid = Array.from({ length: gridRows }, () =>
//       Array(gridCols).fill("")
//     );

//     csvData.forEach((row) => {
//       const well = row["Well no"];
//       const ctRaw = row["Ct value"];
//       const target = row["Target"]?.toString().trim().toUpperCase();
//       const row_id = parseInt(row["Row.No"]);
//       const col_id = parseInt(row["Column no"]);
//       const sampleId = row["Sample iD"];

//       if (!well || ctRaw === undefined || isNaN(row_id) || isNaN(col_id)) return;
//       if (row_id >= gridRows || col_id >= gridCols) return; // Ignore beyond 63×72
//       if (selectedTarget !== "ALL" && target !== selectedTarget) return;

//       const value =
//         ctRaw.toString().trim().toUpperCase() === "UNDETERMINED"
//           ? 0
//           : parseFloat(ctRaw);

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

//   // Keep your processed grids
//   const processedZ = zData;
//   const processedText = textData;

//   // ===== Minimal guards (no logic change for real data) =====
//   const finiteVals = useMemo(
//     () => processedZ.flat().filter((v) => v !== EMPTY_VAL && Number.isFinite(v)),
//     [processedZ]
//   );
//   const hasData = finiteVals.length > 0;

//   // Custom colorscale based on user-defined ranges
//   const createCustomColorscale = () => {
//     // If there is no real data yet, keep the plot white (prevents default blue)
//     if (!hasData) return [[0, "#ffffff"], [1, "#ffffff"]];

//     const zminCR = Math.min(...colorRanges.map((r) => r.min));
//     const zmaxCR = Math.max(...colorRanges.map((r) => r.max));
//     const denom = (zmaxCR - zminCR) || 1; // avoid 0/0 on initial state
//     const normalize = (v) => (v - zminCR) / denom;

//     return [
//       // Force EMPTY_VAL to white
//       [normalize(EMPTY_VAL), "#ffffff"],
//       [normalize(EMPTY_VAL), "#ffffff"],
//       // User ranges
//       ...colorRanges.flatMap((r) => [
//         [normalize(r.min), r.color],
//         [normalize(r.max), r.color],
//       ]),
//     ];
//   };

//   // Keep your original zmin/zmax variables
//   const zmin = Math.min(...colorRanges.map((r) => r.min));
//   const zmax = Math.max(...colorRanges.map((r) => r.max));
//   const provideZBounds = hasData && isFinite(zmin) && isFinite(zmax) && zmax > zmin;

//   // Divider lines
//   const borders = [];
//   const rowStep = 16;
//   const colStep = 24;
//   for (let r = rowStep; r < gridRows; r += rowStep) {
//     borders.push({
//       type: "line",
//       x0: -0.5,
//       y0: r - 0.5,
//       x1: gridCols - 0.5,
//       y1: r - 0.5,
//       line: { color: "black", width: 2 },
//     });
//   }
//   for (let c = colStep; c < gridCols; c += colStep) {
//     borders.push({
//       type: "line",
//       x0: c - 0.5,
//       y0: -0.5,
//       x1: c - 0.5,
//       y1: gridRows - 0.5,
//       line: { color: "black", width: 2 },
//     });
//   }

//   return (
//     <div style={{ textAlign: "center", padding: 5 }}>
//       <h2>384 Well Plate Heatmap</h2>

//       <div style={{ marginBottom: 20 }}>
//         <TargetFilter
//           selectedTarget={selectedTarget}
//           setSelectedTarget={setSelectedTarget}
//         />
//         <input
//           type="file"
//           accept=".csv"
//           id="csv-upload"
//           style={{ display: "none" }}
//           onChange={handleCSVUpload}
//         />
//         <Button
//           icon={<UploadOutlined />}
//           onClick={() => document.getElementById("csv-upload").click()}
//         >
//           Upload CSV
//         </Button>
//         {fileName && (
//           <div style={{ marginTop: 10 }}>
//             <Tag color="green">📄 {fileName}</Tag>
//           </div>
//         )}
//       </div>

//       <ColorHandling384
//         colorRanges={colorRanges}
//         setColorRanges={setColorRanges}
//       />

//       <Plot
//         data={[
//           {
//             z: processedZ,
//             text: processedText,
//             hoverinfo: "text",
//             hovertemplate: "%{text}<extra></extra>",
//             type: "heatmap",
//             colorscale: createCustomColorscale(),
//             showscale: hasData,        // hide until real data exists
//             ...(provideZBounds ? { zmin, zmax } : {}), // only when valid
//             xgap: 0.1,
//             ygap: 0.1,
//           },
//         ]}
//         layout={{
//           width: 800,
//           height: 800,
//           title: `384-Well Plate Heatmap - ${selectedTarget}`,
//           plot_bgcolor: "#000000",
//           paper_bgcolor: "#ffffff",
//           xaxis: { title: "Column", showgrid: false, zeroline: false },
//           yaxis: { title: "Row", autorange: "reversed", showgrid: false, zeroline: false },
//           margin: { t: 50, b: 50, l: 50, r: 50 },
//           shapes: [
//             // thin grid
//             ...Array.from({ length: gridRows + 1 }).map((_, r) => ({
//               type: "line",
//               x0: -0.5,
//               y0: r - 0.5,
//               x1: gridCols - 0.5,
//               y1: r - 0.5,
//               line: { color: "black", width: 0.3 },
//             })),
//             ...Array.from({ length: gridCols + 1 }).map((_, c) => ({
//               type: "line",
//               x0: c - 0.5,
//               y0: -0.5,
//               x1: c - 0.5,
//               y1: gridRows - 0.5,
//               line: { color: "black", width: 0.3 },
//             })),
//             // thicker section dividers
//             ...Array.from({ length: Math.floor(gridRows / 16) }).map((_, i) => ({
//               type: "line",
//               x0: -0.5,
//               y0: 16 * (i + 1) - 0.5,
//               x1: gridCols - 0.5,
//               y1: 16 * (i + 1) - 0.5,
//               line: { color: "black", width: 2 },
//             })),
//             ...Array.from({ length: Math.floor(gridCols / 24) }).map((_, i) => ({
//               type: "line",
//               x0: 24 * (i + 1) - 0.5,
//               y0: -0.5,
//               x1: 24 * (i + 1) - 0.5,
//               y1: gridRows - 0.5,
//               line: { color: "black", width: 2 },
//             })),
//             ...borders,
//           ],
//         }}
//       />

//       <SampleTypePieChart csvData={csvData} />
//     </div>
//   );
// };

// export default HeatmapPlot;


import React, { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Button, message, Tag } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import ColorHandling384 from "./ColorHandling384";
import TargetFilter from "./TargetFilter";
import SampleTypePieChart from "./PiChart";

const HeatmapPlot = () => {
  const gridRows = 63;
  const gridCols = 72;
  const EMPTY_VAL = -1;

  const [zData, setZData] = useState(
    Array.from({ length: gridRows }, () => Array(gridCols).fill(EMPTY_VAL))
  );
  const [textData, setTextData] = useState(
    Array.from({ length: gridRows }, () => Array(gridCols).fill(""))
  );
  const [colorRanges, setColorRanges] = useState([
    { color: "#ffffff", min: -1, max: -1 },
  ]);

  // ✅ adaptive targets
  const [targets, setTargets] = useState(["ALL"]);
  const [selectedTarget, setSelectedTarget] = useState("ALL");

  const [csvData, setCsvData] = useState([]);
  const [wellPositionMap, setWellPositionMap] = useState({});
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    fetch("/384position_map.json")
      .then((res) => res.json())
      .then((data) => setWellPositionMap(data))
      .catch(() => {});
  }, []);

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        setFileName(file.name);
        message.success(`File "${file.name}" uploaded successfully`);
        event.target.value = ""; // allow re-selecting the same file
      },
      error: (err) => {
        message.error(`Upload failed: ${err.message || "Parse error"}`);
        event.target.value = "";
      },
    });
  };

  // ✅ Derive unique targets from CSV adaptively
  useEffect(() => {
    if (!csvData?.length) {
      setTargets(["ALL"]);
      setSelectedTarget("ALL");
      return;
    }

    const unique = Array.from(
      new Set(
        csvData
          .map((r) => (r["Target"] ?? "").toString().trim().toUpperCase())
          .filter(Boolean)
      )
    ).sort();

    const nextTargets = ["ALL", ...unique];
    setTargets(nextTargets);

    if (!nextTargets.includes(selectedTarget)) {
      setSelectedTarget("ALL");
    }
  }, [csvData]);

  useEffect(() => {
    if (!csvData.length) return;

    const grid = Array.from({ length: gridRows }, () =>
      Array(gridCols).fill(EMPTY_VAL)
    );
    const hoverGrid = Array.from({ length: gridRows }, () =>
      Array(gridCols).fill("")
    );

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
        ctRaw.toString().trim().toUpperCase() === "UNDETERMINED"
          ? 0
          : parseFloat(ctRaw);

      if (!isNaN(value)) {
        grid[row_id][col_id] = value;
        hoverGrid[row_id][col_id] =
          `Well: ${well}<br>` +
          `Sample ID: ${sampleId}<br>` +
          `Ct: ${value}<br>` +
          `Row: ${row_id}<br>` +
          `Column: ${col_id}`;
      } else {
        grid[row_id][col_id] = EMPTY_VAL;
        hoverGrid[row_id][col_id] =
          `Well: ${well}<br>` +
          `Sample ID: ${sampleId}<br>` +
          `No Ct Value`;
      }
    });

    setZData(grid);
    setTextData(hoverGrid);
  }, [csvData, selectedTarget]);

  // Keep your processed grids
  const processedZ = zData;
  const processedText = textData;

  // ===== Minimal guards (no logic change for real data) =====
  const finiteVals = useMemo(
    () => processedZ.flat().filter((v) => v !== EMPTY_VAL && Number.isFinite(v)),
    [processedZ]
  );
  const hasData = finiteVals.length > 0;

  // Custom colorscale based on user-defined ranges
  const createCustomColorscale = () => {
    if (!hasData) return [[0, "#ffffff"], [1, "#ffffff"]];

    const zminCR = Math.min(...colorRanges.map((r) => r.min));
    const zmaxCR = Math.max(...colorRanges.map((r) => r.max));
    const denom = zmaxCR - zminCR || 1;
    const normalize = (v) => (v - zminCR) / denom;

    return [
      // Force EMPTY_VAL to white
      [normalize(EMPTY_VAL), "#ffffff"],
      [normalize(EMPTY_VAL), "#ffffff"],
      // User ranges
      ...colorRanges.flatMap((r) => [
        [normalize(r.min), r.color],
        [normalize(r.max), r.color],
      ]),
    ];
  };

  const zmin = Math.min(...colorRanges.map((r) => r.min));
  const zmax = Math.max(...colorRanges.map((r) => r.max));
  const provideZBounds = hasData && isFinite(zmin) && isFinite(zmax) && zmax > zmin;

  // Divider lines
  const borders = [];
  const rowStep = 16;
  const colStep = 24;
  for (let r = rowStep; r < gridRows; r += rowStep) {
    borders.push({
      type: "line",
      x0: -0.5,
      y0: r - 0.5,
      x1: gridCols - 0.5,
      y1: r - 0.5,
      line: { color: "black", width: 2 },
    });
  }
  for (let c = colStep; c < gridCols; c += colStep) {
    borders.push({
      type: "line",
      x0: c - 0.5,
      y0: -0.5,
      x1: c - 0.5,
      y1: gridRows - 0.5,
      line: { color: "black", width: 2 },
    });
  }

  return (
    <div style={{ textAlign: "center", padding: 5 }}>
      <h2>384 Well Plate Heatmap</h2>

      <div style={{ marginBottom: 20 }}>
        {/* ✅ adaptive target filter */}
        <TargetFilter
          selectedTarget={selectedTarget}
          setSelectedTarget={setSelectedTarget}
          targets={targets}
        />

        <input
          type="file"
          accept=".csv"
          id="csv-upload"
          style={{ display: "none" }}
          onChange={handleCSVUpload}
        />
        <Button
          icon={<UploadOutlined />}
          onClick={() => document.getElementById("csv-upload").click()}
        >
          Upload CSV
        </Button>
        {fileName && (
          <div style={{ marginTop: 10 }}>
            <Tag color="green">📄 {fileName}</Tag>
          </div>
        )}
      </div>

      <ColorHandling384
        colorRanges={colorRanges}
        setColorRanges={setColorRanges}
      />

      <Plot
        data={[
          {
            z: processedZ,
            text: processedText,
            hoverinfo: "text",
            hovertemplate: "%{text}<extra></extra>",
            type: "heatmap",
            colorscale: createCustomColorscale(),
            showscale: hasData, // hide until real data exists
            ...(provideZBounds ? { zmin, zmax } : {}), // only when valid
            xgap: 0.1,
            ygap: 0.1,
          },
        ]}
        layout={{
          width: 800,
          height: 800,
          title: `384-Well Plate Heatmap - ${selectedTarget}`,
          plot_bgcolor: "#000000",
          paper_bgcolor: "#ffffff",
          xaxis: { title: "Column", showgrid: false, zeroline: false },
          yaxis: { title: "Row", autorange: "reversed", showgrid: false, zeroline: false },
          margin: { t: 50, b: 50, l: 50, r: 50 },
          shapes: [
            // thin grid
            ...Array.from({ length: gridRows + 1 }).map((_, r) => ({
              type: "line",
              x0: -0.5,
              y0: r - 0.5,
              x1: gridCols - 0.5,
              y1: r - 0.5,
              line: { color: "black", width: 0.3 },
            })),
            ...Array.from({ length: gridCols + 1 }).map((_, c) => ({
              type: "line",
              x0: c - 0.5,
              y0: -0.5,
              x1: c - 0.5,
              y1: gridRows - 0.5,
              line: { color: "black", width: 0.3 },
            })),
            // thicker section dividers
            ...Array.from({ length: Math.floor(gridRows / 16) }).map((_, i) => ({
              type: "line",
              x0: -0.5,
              y0: 16 * (i + 1) - 0.5,
              x1: gridCols - 0.5,
              y1: 16 * (i + 1) - 0.5,
              line: { color: "black", width: 2 },
            })),
            ...Array.from({ length: Math.floor(gridCols / 24) }).map((_, i) => ({
              type: "line",
              x0: 24 * (i + 1) - 0.5,
              y0: -0.5,
              x1: 24 * (i + 1) - 0.5,
              y1: gridRows - 0.5,
              line: { color: "black", width: 2 },
            })),
            ...borders,
          ],
        }}
      />

      <SampleTypePieChart csvData={csvData} />
    </div>
  );
};

export default HeatmapPlot;
