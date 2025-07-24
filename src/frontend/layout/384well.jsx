import React from "react";
import Header from "../component/Header";
import Banner from "../component/Banner";
import DownloadButton from "../component/DownloadButton";
import UploadButton from "../component/UploadButton";

const Well384 = () => {
  return (
    <div style={{ padding: 20 }}>
    <Header/>
        <Banner title='384 Well Plate' 
        subtitle='To use the feature, download existing template and fill in data for analysis'/>
        <div style={{ display: "flex", gap: "20px", marginTop: 50, justifyContent: 'center' }}>
            <DownloadButton filepath="/384-well_layout_template.xlsx"/>
        </div>
    </div>
  );
};

export default Well384;
