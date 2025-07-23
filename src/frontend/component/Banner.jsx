import React from "react";
import { Card } from "antd";

const Banner = ({ title, subtitle }) => {
  return (
    <Card
      style={{
        backgroundColor: "#fafafa",
        marginBottom: 20,
        textAlign: "center",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
      }}
      bodyStyle={{ padding: "20px" }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      {subtitle && (
        <h3 style={{ margin: "10px 0 0 0", fontWeight: "normal" }}>{subtitle}</h3>
      )}
    </Card>
  );
};

export default Banner;
