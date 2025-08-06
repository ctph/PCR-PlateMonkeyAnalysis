import React from "react";
import Header from "../component/Header";
import Banner from "../component/Banner";
import DownloadButton from "../component/DownloadButton";
import HeatmapPlotSmartchip from "../heatmap-logic/HeatmapSmartChip";
import ViolinPlot from "../heatmap-logic/ViolinPlot";
import Footer from "../component/FooterFeaturePage";

const ChipCard = () => {
  return (
    <div style={{ padding: 20 }}>
    <Header/>
        <Banner
          title="SmartChip"
          subtitle={
            <div style={{ textAlign: "center" }}>
              <p>To use the feature:</p>
              <ol style={{ display: "inline-block", textAlign: "left", paddingLeft: 20, marginTop: 5 }}>
                <li>Download existing template and fill in data for analysis.</li>
                <li>Undefined data is set as white color</li>
                <li>Please set your ranges and target first and finally upload your CSV file.</li>
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
            <DownloadButton filepath="/SmartChip_layout_template.xlsx"/>
        </div>
        <div>
          <HeatmapPlotSmartchip/>
        </div>
        <div>
          <ViolinPlot/>
        </div>
        <Footer/>
    </div>  
  );
};

export default ChipCard;
