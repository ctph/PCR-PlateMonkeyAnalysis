import React from "react";
import Header from "../component/Header";
import Banner from "../component/Banner";
import DownloadButton from "../component/DownloadButton";
import UploadButton from "../component/UploadButton";

const ChipCard = () => {
  return (
    <div style={{ padding: 20 }}>
    <Header/>
        <Banner title='SmartChip' 
        subtitle='To use the feature, download existing template and fill in data for analysis'/>
        <div style={{ display: "flex", gap: "20px", marginTop: 50, justifyContent: 'center' }}>
            <DownloadButton/>
            <UploadButton/>
        </div>
    </div>
  );
};

export default ChipCard;
