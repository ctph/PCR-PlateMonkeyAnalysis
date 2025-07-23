import React from "react";
import { Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

const PlateCard384 = () => {
  const navigate = useNavigate();

  const goTo384Well = () => {
    navigate("/384well");
  };

  return (
    <Card
      title="384 Well Plate"
      style={{
        width: 300,
        backgroundColor: "#e6f7ff",  
        color: "black",           
      }}
    >
      <p>Tools for analyzing 384 well plate data</p>
      <Button type="primary" onClick={goTo384Well} style={{marginTop: 30}}>
        Select
      </Button>
    </Card>
  );
};

export default PlateCard384;
