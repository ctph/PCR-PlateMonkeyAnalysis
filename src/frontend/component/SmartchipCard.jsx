import React from "react";
import { Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

const ChipCard = () => {
  const navigate = useNavigate();

  const goToSmartChip = () => {
    navigate("/Smartchip");
  };

  return (
    <Card
      title="SmartChip"
      style={{
        width: 300,
        backgroundColor: "#e6f7ff",  // Light blue background
        color: "black",            // Dark blue text
      }}
    >
      <p>Tools for analyzing SmartChip data</p>
      <Button type="primary" onClick={goToSmartChip} style={{marginTop: 30}}>
        Select
      </Button>
    </Card>
  );
};

export default ChipCard;
