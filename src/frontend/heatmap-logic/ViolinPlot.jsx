import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Input, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const ViolinPlot = () => {
  const [csvData, setCsvData] = useState([]);
  const [cutoff, setCutoff] = useState(35); // Default cutoff
  const [groupedData, setGroupedData] = useState({ NA: [], EU: [], XENO: [] });

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
    if (!csvData || !Array.isArray(csvData)) return;

    const groups = { NA: [], EU: [], XENO: [] };

    csvData.forEach((row) => {
      const well = row["Well no"] || "N/A";
      const ctRaw = row["Ct value"];
      const target = row["Target"]?.toString().trim().toUpperCase();
      const sampleId = row["Sample iD"] || "N/A";
      const rowNo = row["Row.No"] || "N/A";
      const colNo = row["Column no"] || "N/A";

      if (!["NA", "EU", "XENO"].includes(target)) return;

      const ct =
        ctRaw?.toString().trim().toUpperCase() === "UNDETERMINED"
          ? 0
          : parseFloat(ctRaw);

      // Only include values > 0 and <= cutoff
      if (!isNaN(ct) && ct > 0 && ct <= cutoff) {
        const hoverText = `
            Well: ${well}<br>
            Sample ID: ${sampleId}<br>
            Ct: ${ct}<br>
            Row.No: ${rowNo}<br>
            Column no: ${colNo}
        `;

        groups[target].push({ y: ct, text: hoverText });
      }
    });

    setGroupedData(groups);
  }, [csvData, cutoff]); // recompute when cutoff changes

  const plotData = Object.entries(groupedData).map(([target, values]) => ({
    type: "violin",
    y: values.map((v) => v.y),
    text: values.map((v) => v.text),
    hoverinfo: "text",
    name: target,
    box: { visible: true },
    meanline: { visible: true },
    points: "all",
    jitter: 0.3,
    marker: { size: 4 },
  }));

  const layout = {
    title: "Ct Value Distribution by Target (Filtered by Cutoff)",
    yaxis: { title: "Ct Value" },
    xaxis: { title: "Target Group" },
    width: 800,
    height: 500,
    margin: { t: 50, b: 50, l: 50, r: 50 },
    shapes: [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        y0: cutoff,
        y1: cutoff,
        line: {
          color: "red",
          width: 2,
          dash: "dashdot",
        },
      },
    ],
    annotations: [
      {
        xref: "paper",
        yref: "y",
        x: 1,
        y: cutoff,
        text: `Ct Cutoff = ${cutoff}`,
        showarrow: false,
        font: { color: "red", size: 12 },
        align: "right",
      },
    ],
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Ct Value Violin Plot by Target</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="file"
          accept=".csv"
          id="violin-upload"
          style={{ display: "none" }}
          onChange={handleCSVUpload}
        />
        <Button
          icon={<UploadOutlined />}
          onClick={() => document.getElementById("violin-upload").click()}
        >
          Upload CSV
        </Button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>Ct Cutoff:</label>
        <Input
          type="number"
          value={cutoff}
          onChange={(e) => setCutoff(parseFloat(e.target.value))}
          style={{ width: 100 }}
        />
      </div>

      <Plot data={plotData} layout={layout} />
    </div>
  );
};

export default ViolinPlot;


// import React, { useEffect, useState, useRef } from "react";
// import Plot from "react-plotly.js";
// import Papa from "papaparse";
// import { Input, Button } from "antd";
// import { UploadOutlined } from "@ant-design/icons";

// const ViolinPlot = () => {
//   const [csvData, setCsvData] = useState([]);
//   const [cutoff, setCutoff] = useState(35); // Default cutoff
//   const [groupedData, setGroupedData] = useState({ NA: [], EU: [], XENO: [] });
//   const plotRef = useRef();

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
//     if (!csvData || !Array.isArray(csvData)) return;

//     const groups = { NA: [], EU: [], XENO: [] };

//     csvData.forEach((row) => {
//       const well = row["Well no"] || "N/A";
//       const ctRaw = row["Ct value"];
//       const target = row["Target"]?.toString().trim().toUpperCase();
//       const sampleId = row["Sample iD"] || "N/A";
//       const rowNo = row["Row.No"] || "N/A";
//       const colNo = row["Column no"] || "N/A";

//       if (!["NA", "EU", "XENO"].includes(target)) return;

//       const ct =
//         ctRaw?.toString().trim().toUpperCase() === "UNDETERMINED"
//           ? 0
//           : parseFloat(ctRaw);

//       // Only include values > 0 and <= cutoff
//       if (!isNaN(ct) && ct > 0 && ct <= cutoff) {
//         const hoverText = `
//             Well: ${well}<br>
//             Sample ID: ${sampleId}<br>
//             Ct: ${ct}<br>
//             Row.No: ${rowNo}<br>
//             Column no: ${colNo}
//         `;

//         groups[target].push({ y: ct, text: hoverText });
//       }
//     });

//     setGroupedData(groups);
//   }, [csvData, cutoff]); // recompute when cutoff changes

//   // Plotly data
//   const plotData = Object.entries(groupedData).map(([target, values]) => ({
//     type: "violin",
//     y: values.map((v) => v.y),
//     text: values.map((v) => v.text),
//     hoverinfo: "text",
//     name: target,
//     box: { visible: true },
//     meanline: { visible: true },
//     points: "all",
//     jitter: 0.3,
//     marker: { size: 4 },
//   }));

//   // Plot layout
//   const layout = {
//     title: "Ct Value Distribution by Target (Filtered by Cutoff)",
//     yaxis: { title: "Ct Value" },
//     xaxis: { title: "Target Group" },
//     width: 800,
//     height: 500,
//     margin: { t: 50, b: 50, l: 50, r: 50 },
//     dragmode: "zoom",
//     shapes: [
//       {
//         type: "line",
//         xref: "paper",
//         x0: 0,
//         x1: 1,
//         y0: cutoff,
//         y1: cutoff,
//         line: {
//           color: "red",
//           width: 2,
//           dash: "dashdot",
//         },
//       },
//     ],
//     annotations: [
//       {
//         xref: "paper",
//         yref: "y",
//         x: 1,
//         y: cutoff,
//         text: `Ct Cutoff = ${cutoff}`,
//         showarrow: false,
//         font: { color: "red", size: 12 },
//         align: "right",
//       },
//     ],
//   };

//   // Function to extract visible data in cropped region
//   const getCroppedCSV = () => {
//     if (!plotRef.current || !plotRef.current.el) return "";

//     const plotEl = plotRef.current.el;
//     const yRange = plotEl.layout?.yaxis?.range;
//     const xRange = plotEl.layout?.xaxis?.range;

//     if (!yRange) return "";

//     const [yMin, yMax] = yRange;
//     const xGroupKeys = Object.keys(groupedData);
//     const xRangeIndices = xRange || [0, xGroupKeys.length - 1];

//     const visibleData = [];

//     xGroupKeys.forEach((group, i) => {
//       if (i < xRangeIndices[0] || i > xRangeIndices[1]) return;

//       groupedData[group].forEach((point) => {
//         if (point.y >= yMin && point.y <= yMax) {
//           // Extract hoverText info into columns
//           const hoverLines = point.text.split("<br>");
//           const row = {};
//           hoverLines.forEach((line) => {
//             const [key, val] = line.split(":").map((s) => s.trim());
//             row[key] = val;
//           });
//           row["Target"] = group;
//           row["Ct"] = point.y;
//           visibleData.push(row);
//         }
//       });
//     });

//     if (visibleData.length === 0) return "";

//     const headers = ["Target", "Ct", "Well", "Sample ID", "Row.No", "Column no"];
//     const csvContent =
//       headers.join(",") +
//       "\n" +
//       visibleData
//         .map((row) => headers.map((h) => row[h] || "").join(","))
//         .join("\n");

//     return csvContent;
//   };

//   return (
//     <div style={{ padding: 20, textAlign: "center" }}>
//       <h2>Ct Value Violin Plot by Target</h2>

//       {/* CSV Upload */}
//       <div style={{ marginBottom: 20 }}>
//         <input
//           type="file"
//           accept=".csv"
//           id="violin-upload"
//           style={{ display: "none" }}
//           onChange={handleCSVUpload}
//         />
//         <Button
//           icon={<UploadOutlined />}
//           onClick={() => document.getElementById("violin-upload").click()}
//         >
//           Upload CSV
//         </Button>
//       </div>

//       {/* Ct cutoff input */}
//       <div style={{ marginBottom: 20 }}>
//         <label style={{ marginRight: 10 }}>Ct Cutoff:</label>
//         <Input
//           type="number"
//           value={cutoff}
//           onChange={(e) => setCutoff(parseFloat(e.target.value))}
//           style={{ width: 100 }}
//         />
//       </div>

//       {/* Plot */}
//       <Plot
//         data={plotData}
//         layout={layout}
//         ref={plotRef}
//         onRelayout={() => {
//           const csv = getCroppedCSV();
//           console.log("Visible CSV (Zoomed Crop):\n", csv);
//         }}
//       />
//     </div>
//   );
// };

// export default ViolinPlot;
