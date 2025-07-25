import React, { useState } from "react";
import Header from "../component/Header";
import Banner from "../component/Banner";
import DownloadButton from "../component/DownloadButton";
import HeatmapPlot from "../heatmap-logic/HeatmapPlot96";

const Well96 = () => {
  const [uploadedData, setUploadedData] = useState(null);

  const handleFileUpload = (file) => {
    console.log("Uploaded 96-well CSV:", file);
    setUploadedData(file);
  };

  return (
    <div style={{ padding: 20 }}>
    <Header/>
        <Banner title='96 Well Plate' 
        subtitle='To use the feature, download existing template and fill in data for analysis. Please set your ranges and target first and finally upload your csv file'/>
        <div style={{ display: "flex", gap: "20px", marginTop: 50, justifyContent: 'center' }}>
            <DownloadButton filepath="/96-well_layout_template.xlsx"/>
        </div>
        {/* Heatmap & Color Picker */}
        <div style={{ marginTop: 50 }}>
          <HeatmapPlot/>
        </div>
    </div>
  );
};

export default Well96;
