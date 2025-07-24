import React from "react";
import Header from "../component/Header";
import Banner from "../component/Banner";
import DownloadButton from "../component/DownloadButton";

const ChipCard = () => {
  return (
    <div style={{ padding: 20 }}>
    <Header/>
        <Banner title='SmartChip' 
        subtitle='To use the feature, download existing template and fill in data for analysis'/>
        <div style={{ display: "flex", gap: "20px", marginTop: 50, justifyContent: 'center' }}>
            <DownloadButton filepath="/SmartChip_layout_template.xlsx"/>
        </div>
    </div>
  );
};

export default ChipCard;
