import React from "react";
import { Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

const PlateCard = () => {
  const navigate = useNavigate();

  const goTo96Well = () => {
    navigate("/96well");
  };

  return (
    <Card
      title="96 Well Plate"
      style={{
        width: 300,
        backgroundColor: "#e6f7ff",  
        color: "black",           
      }}
    >
      <p>Tools for analyzing 96 well plate data</p>
      <Button type="primary" onClick={goTo96Well} style={{marginTop: 30}}>
        Select
      </Button>
    </Card>
  );
};

export default PlateCard;
