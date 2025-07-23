import React from "react";
import PlateCard from "../component/Card";
import PlateCard384 from "../component/384Card";
import ChipCard from "../component/SmartchipCard";
import Banner from "../component/Banner";
import Header from "../component/Header";

const HomePage = () => {
  return (
    <div style={{ padding: 20 }}>
      <Header/>
      <Banner title = "High volume real-time PCR assay with smart chip"
      subtitle = " Web based Data analysis on the go with advanced PCR processing"/>
      
      {/* Flexbox container for side-by-side cards */}
      <div style={{ display: "flex", gap: "20px", marginTop: 50, justifyContent: 'center' }}>
        <PlateCard />
        <PlateCard384 />
        <ChipCard/>
      </div>
    </div>
  );
};

export default HomePage;


