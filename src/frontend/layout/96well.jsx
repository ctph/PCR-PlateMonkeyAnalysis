import React, { useState } from "react";
import Header from "../component/Header";
import Banner from "../component/Banner";
import DownloadButton from "../component/DownloadButton";
import HeatmapPlot from "../heatmap-logic/HeatmapPlot96";
import ViolinPlot from '../heatmap-logic/ViolinPlot';
import PiChart from '../heatmap-logic/PiChart'
import Footer from "../component/FooterFeaturePage";

const Well96 = () => {
  const [uploadedData, setUploadedData] = useState(null);

  const handleFileUpload = (file) => {
    console.log("Uploaded 96-well CSV:", file);
    setUploadedData(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <Header/>
        <Banner
          title="96 Well Plate"
          subtitle={
            <div style={{ textAlign: "center" }}>
              <p>To use the feature:</p>
              <ol style={{ display: "inline-block", textAlign: "left", paddingLeft: 20, marginTop: 5 }}>
                <li>Download existing template and fill in data for analysis.</li>
                <li>Undefined data is set as white color</li>
                <li>Please set your ranges and finally upload your CSV file.</li>
                <li>Filter target and heatmap will be plot accordingly</li>
              </ol>
              <p style={{ marginTop: 10 }}>
                Crop the section needed on violin plot to identify the range and generate a CSV file.
                <br />
                The cropped section includes every target within the range.
                <br />
                All content within the zoom in view will be downloaded as a CSV.
              </p>
            </div>
          }
        />

        <div style={{ display: "flex", gap: "20px", marginTop: 50, justifyContent: 'center' }}>
            <DownloadButton filepath="/96-well_layout_template.xlsx"/>
        </div>
        {/* Heatmap & Color Picker */}
        <div style={{ marginTop: 50 }}>
          <HeatmapPlot/>
        </div>
        <div style={{ marginTop: 50 }}>
          <ViolinPlot/>
        </div>
        <Footer/>
    </div>
  );
};

export default Well96;
