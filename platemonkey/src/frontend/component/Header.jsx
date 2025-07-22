// components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "antd";

const { Title } = Typography;

const Header = () => (
  <div style={{ textAlign: "left", marginBottom: 16}}>
    <Link to="/" style={{ textDecoration: "none" }}>
      <Title level={2} style={{ color: "#1677ff", marginBottom: 50 }}>
        PlateMonkey Analysis
      </Title>
    </Link>
  </div>
);

export default Header;
