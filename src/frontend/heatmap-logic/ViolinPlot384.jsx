// import React, { useEffect, useState, useRef } from "react";
// import Plot from "react-plotly.js";
// import Papa from "papaparse";
// import { Input, Button } from "antd";
// import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";

// const ViolinPlot384 = () => {
//   const [csvData, setCsvData] = useState([]);
//   const [cutoff, setCutoff] = useState(35);
//   const [groupedData, setGroupedData] = useState({});
//   const [yRange, setYRange] = useState(null); // stores [minY, maxY] after zoom
//   const plotRef = useRef();

//   // 1. Load & parse the CSV
//   const handleCSVUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (res) => setCsvData(res.data),
//     });
//   };

//   // 2. Group rows by target and apply cutoff filter
//   useEffect(() => {
//     if (!csvData.length) return;
//     const groups = { NA: [], EU: [], XENO: [], IAV: [], MGENE: [], XIPC: [] };
//     csvData.forEach((row) => {
//       const rawCt = (row["Ct value"] || "").toString().trim().toUpperCase();
//       const ct = rawCt === "UNDETERMINED" ? 0 : parseFloat(rawCt);
//       const target = (row["Target"] || "").toString().trim().toUpperCase();
//       if (!groups[target] || isNaN(ct) || ct <= 0 || ct > cutoff) return;

//       groups[target].push({
//         x: target,
//         y: ct,
//         text:
//           `Well: ${row["Well no"] || "N/A"}<br>` +
//           `Sample ID: ${row["Sample iD"] || "N/A"}<br>` +
//           `Ct: ${ct}<br>` +
//           `Row: ${row["Row.No"] || "N/A"}<br>` +
//           `Col: ${row["Column no"] || "N/A"}`,
//         // keep original row for later CSV export
//         _orig: {
//           "Well no": row["Well no"] || "",
//           "Row.No": row["Row.No"] || "",
//           "Column no": row["Column no"] || "",
//           "Sample iD": row["Sample iD"] || "",
//           "Target": target,
//           "Ct value": ct,
//         },
//       });
//     });
//     setGroupedData(groups);
//     setYRange(null); // reset zoom whenever data or cutoff changes
//   }, [csvData, cutoff]);

//   // 3. Build Plotly traces from groupedData
//   const plotData = Object.entries(groupedData).map(([target, vals]) => ({
//     type: "violin",
//     x: vals.map((v) => v.x),
//     y: vals.map((v) => v.y),
//     text: vals.map((v) => v.text),
//     hoverinfo: "text",
//     name: target,
//     box: { visible: true },
//     meanline: { visible: true },
//     points: "all",
//     jitter: 0.3,
//     marker: { size: 4 },
//   }));

//   // 4. Layout: uses yRange to lock axis when zoomed
//   const layout = {
//     title: `Ct Distribution (≤ ${cutoff})`,
//     dragmode: "zoom",
//     width: 900,
//     height: 500,
//     margin: { t: 50, b: 50, l: 50, r: 50 },
//     yaxis: {
//       title: "Ct Value",
//       autorange: yRange === null,
//       range: yRange || undefined,
//     },
//     xaxis: { title: "Target Group" },
//   };

//   // 5. onRelayout handler captures y-axis range on zoom or resets on double-click
//   const handleRelayout = (evt) => {
//     const y0 = evt["yaxis.range[0]"], y1 = evt["yaxis.range[1]"];
//     if (y0 != null && y1 != null) {
//       setYRange([y0, y1]);
//     } else {
//       setYRange(null);
//     }
//   };

//   // 6. Filter original csvData rows to those within the zoomed yRange
//   const getVisibleRows = () => {
//     if (!yRange) return [];
//     const [minY, maxY] = yRange;
//     return csvData.filter((row) => {
//       const rawCt = (row["Ct value"] || "")
//         .toString()
//         .trim()
//         .toUpperCase();
//       const ct = rawCt === "UNDETERMINED" ? 0 : parseFloat(rawCt);
//       return ct >= minY && ct <= maxY && ct > 0 && ct <= cutoff;
//     });
//   };

//   // 7. Build and trigger CSV download of those visible rows
//   const downloadCSV = () => {
//     if (!yRange) return;
//     const rows = getVisibleRows();
//     if (!rows.length) return;

//     // Define columns & header row
//     const columns = [
//       "Well no",
//       "Row.No",
//       "Column no",
//       "Sample iD",
//       "Target",
//       "Ct value",
//     ];
//     const lines = [columns.join(",")];

//     // Append each filtered row
//     rows.forEach((r) => {
//       const line = columns
//         .map((col) => {
//           // For Ct value, we've parsed to a number; others are strings
//           const val =
//             col === "Ct value" ? r["Ct value"] : r[col] || "";
//           // Escape double-quotes in values
//           return `"${String(val).replace(/"/g, '""')}"`;
//         })
//         .join(",");
//       lines.push(line);
//     });

//     // Create blob & download
//     const blob = new Blob([lines.join("\n")], {
//       type: "text/csv;charset=utf-8;",
//     });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `cropped_ct_${Math.floor(yRange[0])}-${Math.ceil(
//       yRange[1]
//     )}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }
//   return (
//     <div style={{ padding: 20, textAlign: "center" }}>
//       <h2>384-Well CT Violin Plot</h2>

//       <div style={{ marginBottom: 20 }}>
//         <input
//           id="fileUpload"
//           type="file"
//           accept=".csv"
//           style={{ display: "none" }}
//           onChange={handleCSVUpload}
//         />
//         <Button
//           icon={<UploadOutlined />}
//           onClick={() => document.getElementById("fileUpload").click()}
//         >
//           Upload CSV
//         </Button>

//         <span style={{ marginLeft: 20 }}>
//           Cutoff:{" "}
//           <Input
//             type="number"
//             value={cutoff}
//             onChange={(e) => setCutoff(parseFloat(e.target.value))}
//             style={{ width: 80 }}
//           />
//         </span>
//       </div>

//       <Plot
//         ref={plotRef}
//         data={plotData}
//         layout={layout}
//         config={{ responsive: true }}
//         onRelayout={handleRelayout}
//       />

//       <div style={{ marginTop: 20 }}>
//         <Button
//           icon={<DownloadOutlined />}
//           type="primary"
//           onClick={downloadCSV}
//           disabled={!yRange}
//         >
//           Download Cropped CSV
//         </Button>
//       </div>
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

  // 2. Group rows by TARGET (ADAPTIVE) and apply cutoff filter
  useEffect(() => {
    if (!csvData.length) return;

    // Discover unique targets (uppercased) present in CSV
    const discoveredTargets = Array.from(
      new Set(
        csvData
          .map((row) => (row["Target"] || "").toString().trim().toUpperCase())
          .filter(Boolean)
      )
    ).sort();

    // Build empty buckets for discovered targets
    const groups = discoveredTargets.reduce((acc, t) => {
      acc[t] = [];
      return acc;
    }, {});

    // Populate buckets (same filtering logic as before)
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

  // 3. Build Plotly traces from groupedData (unchanged behavior)
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

  // 6. Filter original csvData rows to those within the zoomed yRange (unchanged)
  const getVisibleRows = () => {
    if (!yRange) return [];
    const [minY, maxY] = yRange;
    return csvData.filter((row) => {
      const rawCt = (row["Ct value"] || "").toString().trim().toUpperCase();
      const ct = rawCt === "UNDETERMINED" ? 0 : parseFloat(rawCt);
      return ct >= minY && ct <= maxY && ct > 0 && ct <= cutoff;
    });
  };

  // 7. Build and trigger CSV download of those visible rows (unchanged)
  const downloadCSV = () => {
    if (!yRange) return;
    const rows = getVisibleRows();
    if (!rows.length) return;

    const columns = [
      "Well no",
      "Row.No",
      "Column no",
      "Sample iD",
      "Target",
      "Ct value",
    ];
    const lines = [columns.join(",")];

    rows.forEach((r) => {
      const line = columns
        .map((col) => `"${String((col === "Ct value" ? r["Ct value"] : r[col] || "")).replace(/"/g, '""')}"`)
        .join(",");
      lines.push(line);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cropped_ct_${Math.floor(yRange[0])}-${Math.ceil(yRange[1])}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
