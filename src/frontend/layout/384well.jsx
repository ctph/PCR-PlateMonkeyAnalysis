import React from "react";
import Header from "../component/Header";
import Banner from "../component/Banner";
import DownloadButton from "../component/DownloadButton";
import HeatmapPlot384 from "../heatmap-logic/HeatmapPlot384";
import ViolinPlot384 from "../heatmap-logic/ViolinPlot384";

const Well384 = () => {
  return (
    <div style={{ padding: 20 }}>
    <Header/>
        <Banner title='384 Well Plate' 
        subtitle='To use the feature, download existing template and fill in data for analysis. Please set your ranges and target first and finally upload your csv file'/>
        <div style={{ display: "flex", gap: "20px", marginTop: 50, justifyContent: 'center' }}>
            <DownloadButton filepath="/384-well_layout_template.xlsx"/>
        </div>
        {/* Heatmap & Color Picker */}
        <div style={{ marginTop: 50 }}>
          <HeatmapPlot384 />
        </div>
        {/*Violin Plot*/}
        <div style={{ marginTop: 50 }}>
          <ViolinPlot384 />
        </div>
    </div>
  );
};

export default Well384;
