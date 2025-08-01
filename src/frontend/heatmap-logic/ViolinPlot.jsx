// import React, { useEffect, useState } from "react";
// import Plot from "react-plotly.js";
// import Papa from "papaparse";
// import { Input, Button } from "antd";
// import { UploadOutlined } from "@ant-design/icons";

// const ViolinPlot = () => {
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

//   const layout = {
//     title: "Ct Value Distribution by Target (Filtered by Cutoff)",
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
//         font: { color: "red", size: 12 },
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
//           onClick={() => document.getElementById("violin-upload").click()}
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

// export default ViolinPlot;

import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Input, Button } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";

const ViolinPlot = () => {
  const [csvData, setCsvData] = useState([]);
  const [cutoff, setCutoff] = useState(35);
  const [groupedData, setGroupedData] = useState({ NA: [], EU: [], XENO: [] });
  const [zoomRange, setZoomRange] = useState([null, null]); // [yMin, yMax]

  // 1️⃣ Load CSV
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setCsvData(res.data),
    });
  };

  // 2️⃣ Group & cutoff
  useEffect(() => {
    if (!csvData.length) return;
    const groups = { NA: [], EU: [], XENO: [] };
    csvData.forEach((row) => {
      const rawCt = (row["Ct value"] || "").toString().trim().toUpperCase();
      const ct = rawCt === "UNDETERMINED" ? 0 : parseFloat(rawCt);
      const target = (row["Target"] || "").toString().trim().toUpperCase();
      if (!groups[target] || isNaN(ct) || ct <= 0 || ct > cutoff) return;
      groups[target].push({
        y: ct,
        text: `
          Well: ${row["Well no"] || "N/A"}<br>
          Sample ID: ${row["Sample iD"] || "N/A"}<br>
          Ct: ${ct}<br>
          Row: ${row["Row.No"] || "N/A"}<br>
          Col: ${row["Column no"] || "N/A"}
        `,
        _orig: row,
      });
    });
    setGroupedData(groups);
    setZoomRange([null, null]);
  }, [csvData, cutoff]);

  // 3️⃣ Build traces
  const plotData = Object.entries(groupedData).map(([t, vals]) => ({
    type: "violin",
    y: vals.map((v) => v.y),
    text: vals.map((v) => v.text),
    hoverinfo: "text",
    name: t,
    box: { visible: true },
    meanline: { visible: true },
    points: "all",
    jitter: 0.3,
    marker: { size: 4 },
  }));

  // 4️⃣ Layout
  const layout = {
    title: `Ct Value Distribution (≤ ${cutoff})`,
    dragmode: "zoom",
    width: 800,
    height: 500,
    margin: { t: 50, b: 50, l: 50, r: 50 },
    yaxis: {
      title: "Ct Value",
      autorange: zoomRange[0] == null,
      range: zoomRange[0] != null ? zoomRange : undefined,
    },
    xaxis: { title: "Target Group" },
  };

  // 5️⃣ Capture zoom
  const handleRelayout = (evt) => {
    const y0 = evt["yaxis.range[0]"], y1 = evt["yaxis.range[1]"];
    if (y0 != null && y1 != null) {
      setZoomRange([y0, y1]);
    } else {
      setZoomRange([null, null]); // reset on double-click
    }
  };

  // 6️⃣ Filter for download
  const getVisibleRows = () => {
    const [yMin, yMax] = zoomRange;
    return csvData.filter((row) => {
      const rawCt = (row["Ct value"] || "").toString().trim().toUpperCase();
      const ct = rawCt === "UNDETERMINED" ? 0 : parseFloat(rawCt);
      const target = (row["Target"] || "").toString().trim().toUpperCase();
      if (!["NA","EU","XENO"].includes(target) || isNaN(ct) || ct <= 0 || ct > cutoff)
        return false;
      if (yMin != null && yMax != null) {
        return ct >= yMin && ct <= yMax;
      }
      return true;
    });
  };

  // 7️⃣ Download
  const downloadZoomedCSV = () => {
    const rows = getVisibleRows();
    if (!rows.length || zoomRange[0] == null) return;

    const headers = ["Well no", "Row.No", "Column no", "Sample iD", "Target", "Ct value"];
    const lines = [headers.join(",")];
    rows.forEach((r) => {
      lines.push(
        headers
          .map((h) => `"${String(r[h] ?? "")}"`)
          .join(",")
      );
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `zoomed_ct_${Math.floor(zoomRange[0])}-${Math.ceil(zoomRange[1])}.csv`;
    link.click();
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>CT Violin Plot</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          id="violin-upload"
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleCSVUpload}
        />
        <Button icon={<UploadOutlined />} onClick={() => document.getElementById("violin-upload").click()}>
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
        data={plotData}
        layout={layout}
        config={{ responsive: true, scrollZoom: true, displaylogo: false }}
        onRelayout={handleRelayout}
      />

      {/* Center via wrapper */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          onClick={downloadZoomedCSV}
          disabled={zoomRange[0] == null}
        >
          Download Cropped CSV
        </Button>
      </div>
    </div>
  );
};

export default ViolinPlot;
