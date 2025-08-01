// import React, { useEffect, useState } from "react";
// import Plot from "react-plotly.js";
// import Papa from "papaparse";
// import { Input, Button } from "antd";
// import { UploadOutlined } from "@ant-design/icons";

// const ViolinPlot384 = () => {
//   const [csvData, setCsvData] = useState([]);
//   const [cutoff, setCutoff] = useState(35); // Default cutoff
//   const [groupedData, setGroupedData] = useState({ NA: [], EU: [], XENO: [] });

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

//     const groups = { NA: [], EU: [], XENO: [], IAV: [], MGENE: [], XIPC: [] };

//     csvData.forEach((row) => {
//         const well = row["Well no"] || "N/A";
//         const ctRaw = row["Ct value"];
//         const target = row["Target"]?.toString().trim().toUpperCase();
//         const sampleId = row["Sample iD"] || "N/A";
//         const rowNo = row["Row.No"] || "N/A";
//         const colNo = row["Column no"] || "N/A";

//         if (!["NA", "EU", "XENO", "IAV", "MGENE", "XIPC"].includes(target)) return;

//         const ct = ctRaw?.toString().trim().toUpperCase() === "UNDETERMINED" ? 0 : parseFloat(ctRaw);

//         if (!isNaN(ct) && ct > 0) {
//         const hoverText = `
//             Well: ${well}<br>
//             Sample ID: ${sampleId}<br>
//             Ct: ${ct}<br>
//             Row.No: ${rowNo}<br>
//             Column no: ${colNo}
//         `;

//         groups[target].push({ y: ct, text: hoverText });
//         }
//     });

//     setGroupedData(groups);
//     }, [csvData]);

//   const plotData = Object.entries(groupedData).map(([target, values]) => ({
//     type: "violin",
//     y: values.map(v => v.y),
//     text: values.map(v => v.text),
//     hoverinfo: "text",
//     name: target,
//     box: { visible: true },
//     meanline: { visible: true },
//     points: "all",
//     jitter: 0.3,
//     marker: { size: 4 },
//     }));

//   const layout = {
//     title: "Ct Value Distribution by Target",
//     yaxis: { title: "Ct Value" },
//     xaxis: { title: "Target Group" },
//     width: 800,
//     height: 500,
//     margin: { t: 50, b: 50, l: 50, r: 50 },
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
//         font: {
//           color: "red",
//           size: 12,
//         },
//         align: "right",
//       },
//     ],
//   };

//   return (
//     <div style={{ padding: 20, textAlign: "center" }}>
//       <h2>Ct Value Violin Plot by Target</h2>

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
//           onClick={() =>
//             document.getElementById("violin-upload").click()
//           }
//         >
//           Upload CSV
//         </Button>
//       </div>

//       <div style={{ marginBottom: 20 }}>
//         <label style={{ marginRight: 10 }}>Ct Cutoff:</label>
//         <Input
//           type="number"
//           value={cutoff}
//           onChange={(e) => setCutoff(parseFloat(e.target.value))}
//           style={{ width: 100 }}
//         />
//       </div>

//       <Plot data={plotData} layout={layout} />
//     </div>
//   );
// };

// export default ViolinPlot384;

import React, { useEffect, useState, useRef } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Input, Button } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";

const ViolinPlot384 = () => {
  const [csvData, setCsvData] = useState([]);
  const [cutoff, setCutoff] = useState(35);
  const [groupedData, setGroupedData] = useState({});
  const [yRange, setYRange] = useState(null); // stores [minY, maxY] after zoom
  const plotRef = useRef();

  // 1. Load & parse the CSV
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setCsvData(res.data),
    });
  };

  // 2. Group rows by target and apply cutoff filter
  useEffect(() => {
    if (!csvData.length) return;
    const groups = { NA: [], EU: [], XENO: [], IAV: [], MGENE: [], XIPC: [] };
    csvData.forEach((row) => {
      const rawCt = (row["Ct value"] || "").toString().trim().toUpperCase();
      const ct = rawCt === "UNDETERMINED" ? 0 : parseFloat(rawCt);
      const target = (row["Target"] || "").toString().trim().toUpperCase();
      if (!groups[target] || isNaN(ct) || ct <= 0 || ct > cutoff) return;

      groups[target].push({
        x: target,
        y: ct,
        text:
          `Well: ${row["Well no"] || "N/A"}<br>` +
          `Sample ID: ${row["Sample iD"] || "N/A"}<br>` +
          `Ct: ${ct}<br>` +
          `Row: ${row["Row.No"] || "N/A"}<br>` +
          `Col: ${row["Column no"] || "N/A"}`,
        // keep original row for later CSV export
        _orig: {
          "Well no": row["Well no"] || "",
          "Row.No": row["Row.No"] || "",
          "Column no": row["Column no"] || "",
          "Sample iD": row["Sample iD"] || "",
          "Target": target,
          "Ct value": ct,
        },
      });
    });
    setGroupedData(groups);
    setYRange(null); // reset zoom whenever data or cutoff changes
  }, [csvData, cutoff]);

  // 3. Build Plotly traces from groupedData
  const plotData = Object.entries(groupedData).map(([target, vals]) => ({
    type: "violin",
    x: vals.map((v) => v.x),
    y: vals.map((v) => v.y),
    text: vals.map((v) => v.text),
    hoverinfo: "text",
    name: target,
    box: { visible: true },
    meanline: { visible: true },
    points: "all",
    jitter: 0.3,
    marker: { size: 4 },
  }));

  // 4. Layout: uses yRange to lock axis when zoomed
  const layout = {
    title: `Ct Distribution (≤ ${cutoff})`,
    dragmode: "zoom",
    width: 900,
    height: 500,
    margin: { t: 50, b: 50, l: 50, r: 50 },
    yaxis: {
      title: "Ct Value",
      autorange: yRange === null,
      range: yRange || undefined,
    },
    xaxis: { title: "Target Group" },
  };

  // 5. onRelayout handler captures y-axis range on zoom or resets on double-click
  const handleRelayout = (evt) => {
    const y0 = evt["yaxis.range[0]"], y1 = evt["yaxis.range[1]"];
    if (y0 != null && y1 != null) {
      setYRange([y0, y1]);
    } else {
      setYRange(null);
    }
  };

  // 6. Filter original csvData rows to those within the zoomed yRange
  const getVisibleRows = () => {
    if (!yRange) return [];
    const [minY, maxY] = yRange;
    return csvData.filter((row) => {
      const rawCt = (row["Ct value"] || "")
        .toString()
        .trim()
        .toUpperCase();
      const ct = rawCt === "UNDETERMINED" ? 0 : parseFloat(rawCt);
      return ct >= minY && ct <= maxY && ct > 0 && ct <= cutoff;
    });
  };

  // 7. Build and trigger CSV download of those visible rows
  const downloadCSV = () => {
    if (!yRange) return;
    const rows = getVisibleRows();
    if (!rows.length) return;

    // Define columns & header row
    const columns = [
      "Well no",
      "Row.No",
      "Column no",
      "Sample iD",
      "Target",
      "Ct value",
    ];
    const lines = [columns.join(",")];

    // Append each filtered row
    rows.forEach((r) => {
      const line = columns
        .map((col) => {
          // For Ct value, we've parsed to a number; others are strings
          const val =
            col === "Ct value" ? r["Ct value"] : r[col] || "";
          // Escape double-quotes in values
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",");
      lines.push(line);
    });

    // Create blob & download
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cropped_ct_${Math.floor(yRange[0])}-${Math.ceil(
      yRange[1]
    )}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>384-Well CT Violin Plot</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          id="fileUpload"
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleCSVUpload}
        />
        <Button
          icon={<UploadOutlined />}
          onClick={() => document.getElementById("fileUpload").click()}
        >
          Upload CSV
        </Button>

        <span style={{ marginLeft: 20 }}>
          Cutoff:{" "}
          <Input
            type="number"
            value={cutoff}
            onChange={(e) => setCutoff(parseFloat(e.target.value))}
            style={{ width: 80 }}
          />
        </span>
      </div>

      <Plot
        ref={plotRef}
        data={plotData}
        layout={layout}
        config={{ responsive: true }}
        onRelayout={handleRelayout}
      />

      <div style={{ marginTop: 20 }}>
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          onClick={downloadCSV}
          disabled={!yRange}
        >
          Download Cropped CSV
        </Button>
      </div>
    </div>
  );
};

export default ViolinPlot384;