import React, { useState } from "react";
import HeatmapPlot from "./HeatmapPlot";
import ViolinPlot from "./ViolinPlot";

const PlateMonkeyApp = () => {
  const [csvData, setCsvData] = useState([]);

  return (
    <div>
      <HeatmapPlot csvData={csvData} setCsvData={setCsvData} />
      <ViolinPlot csvData={csvData} />
    </div>
  );
};

export default PlateMonkeyApp;
