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
            <div style={{ textAlign: "center" }}>
              <p>To use the feature:</p>
              <ol style={{ display: "inline-block", textAlign: "left", paddingLeft: 20, marginTop: 5 }}>
                <li>Download existing template and fill in data for analysis.</li>
                <li>Leave first color ranges as default, it highlights both 0 and undefined data.</li>
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
