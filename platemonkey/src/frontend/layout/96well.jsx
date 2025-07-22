import React from "react";
import Header from "../component/Header";
import Banner from "../component/Banner";
import DownloadButton from "../component/DownloadButton";

const Well96 = () => {
  return (
    <div style={{ padding: 20 }}>
        <Header/>
        <Banner title='96 Well Plate' 
        subtitle='To use the feature, download existing template and fill in data for analysis'/>
        <DownloadButton/>
    </div>
  );
};

export default Well96;
