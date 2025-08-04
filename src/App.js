import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./frontend/layout/HomePage";
import Well96 from "./frontend/layout/96well";
import Well384 from "./frontend/layout/384well";
import SmartChipPage from "./frontend/layout/Smartchip";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/96well" element={<Well96 />} />
        <Route path="/384well" element={<Well384 />} />
        <Route path="/Smartchip" element={<SmartChipPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
