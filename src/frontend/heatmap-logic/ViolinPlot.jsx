import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import { Input, Button } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";

const ViolinPlot = () => {
  const [csvData, setCsvData] = useState([]);
  const [cutoff, setCutoff] = useState(35);
  // CHANGED: start empty, we’ll fill dynamically from CSV
  const [groupedData, setGroupedData] = useState({});
  // CHANGED: track discovered targets for filtering & download
  const [targets, setTargets] = useState([]);
  const [zoomRange, setZoomRange] = useState([null, null]); // [yMin, yMax]

  // Load CSV
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setCsvData(res.data),
    });
  };

  // Group & cutoff (adaptive targets)
  useEffect(() => {
    if (!csvData.length) return;

    // discover unique targets present in CSV (uppercased)
    const discovered = Array.from(
      new Set(
        csvData
          .map((row) => (row["Target"] || "").toString().trim().toUpperCase())
          .filter(Boolean)
      )
    ).sort();

    // build empty buckets for all discovered targets
    const groups = discovered.reduce((acc, t) => {
      acc[t] = [];
      return acc;
    }, {});

    // populate with rows that pass cutoff + data validity
    csvData.forEach((row) => {
      const rawCt = (row["Ct value"] || "").toString().trim().toUpperCase();
      const ct = rawCt === "UNDETERMINED" ? 0 : parseFloat(rawCt);
      const target = (row["Target"] || "").toString().trim().toUpperCase();

      // respect previous behavior: skip invalid/zero/over-cutoff
      if (!groups[target] || isNaN(ct) || ct <= 0 || ct > cutoff) return;

      groups[target].push({
        y: ct,
        text: `
          Assay: ${row["Assay"] || "N/A"}<br>
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
    setTargets(discovered);
    setZoomRange([null, null]); // reset zoom like before
  }, [csvData, cutoff]);

  // Build traces (unchanged behavior, now from dynamic groups)
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

  // Layout (unchanged)
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

  // Capture zoom (unchanged)
  const handleRelayout = (evt) => {
    const y0 = evt["yaxis.range[0]"], y1 = evt["yaxis.range[1]"];
    if (y0 != null && y1 != null) {
      setZoomRange([y0, y1]);
    } else {
      setZoomRange([null, null]); // reset on double-click
    }
  };

  // Filter for download (use dynamic targets; logic otherwise same)
  const getVisibleRows = () => {
    const [yMin, yMax] = zoomRange;
    const targetSet = new Set(targets);
    return csvData.filter((row) => {
      const rawCt = (row["Ct value"] || "").toString().trim().toUpperCase();
      const ct = rawCt === "UNDETERMINED" ? 0 : parseFloat(rawCt);
      const target = (row["Target"] || "").toString().trim().toUpperCase();
      if (!targetSet.has(target) || isNaN(ct) || ct <= 0 || ct > cutoff) return false;
      if (yMin != null && yMax != null) {
        return ct >= yMin && ct <= yMax;
      }
      return true;
    });
  };

  // Download (unchanged)
  const downloadZoomedCSV = () => {
    const rows = getVisibleRows();
    if (!rows.length || zoomRange[0] == null) return;

    const headers = ["Well no", "Row.No", "Column no", "Sample iD", "Target", "Ct value"];
    const lines = [headers.join(",")];
    rows.forEach((r) => {
      lines.push(
        headers.map((h) => `"${String(r[h] ?? "")}"`).join(",")
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