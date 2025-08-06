import React from "react";
import Header from "../component/Header";
import Banner from "../component/Banner";
import DownloadButton from "../component/DownloadButton";
import HeatmapPlot384 from "../heatmap-logic/HeatmapPlot384";
import ViolinPlot384 from "../heatmap-logic/ViolinPlot384";
import Footer from "../component/FooterFeaturePage";

const Well384 = () => {
  return (
    <div style={{ padding: 20 }}>
    <Header/>
        <Banner
          title="384 Well Plate"
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
        <Footer/>
    </div>
  );
};

export default Well384;
