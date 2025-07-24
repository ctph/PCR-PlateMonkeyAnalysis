import React, { useState } from "react";
import Header from "../component/Header";
import Banner from "../component/Banner";
import DownloadButton from "../component/DownloadButton";
import UploadButton from "../component/UploadButton";
import HeatmapPlot from "../heatmap-logic/HeatmapPlot";

const Well96 = () => {
  const [uploadedData, setUploadedData] = useState(null);

  const handleFileUpload = (file) => {
    console.log("Uploaded 96-well CSV:", file);
    // TODO: Parse CSV (e.g., with PapaParse) and store data in uploadedData
    setUploadedData(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <Header />

      <Banner
        title="96 Well Plate"
        subtitle="Download the template, fill in the CT values, and upload it for analysis"
      />

      {/* Download & Upload Buttons */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: 30,
          justifyContent: "center",
        }}
      >
        <DownloadButton filePath="/96-well_layout_template.xlsx" />
        {/* <UploadButton onFileSelect={handleFileUpload} /> */}
      </div>

      {/* Heatmap & Color Picker */}
      <div style={{ marginTop: 50 }}>
        <HeatmapPlot />
      </div>
    </div>
  );
};

export default Well96;
