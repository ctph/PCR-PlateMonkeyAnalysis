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
        <Banner title='SmartChip' 
        subtitle='To use the feature, download existing template and fill in data for analysis. Please set your ranges and target first and finally upload your csv file'/>
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
