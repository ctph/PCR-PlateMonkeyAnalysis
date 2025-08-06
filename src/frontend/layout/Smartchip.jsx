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
          title="96 Well Plate"
          subtitle={
            <>
              To use the feature:
              <br />
              1. Download existing template and fill in data for analysis. 
              <br />
              2. Leave first color ranges as default, it highlight both 0 and undefined data.
              <br />
              3. Please set your ranges and target first and finally upload your csv file.
              <br />
              Crop the section needed on violin plot to identify the range and generate a csv file.
              <br />
              The cropped section include every target within the range.
            </>
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
