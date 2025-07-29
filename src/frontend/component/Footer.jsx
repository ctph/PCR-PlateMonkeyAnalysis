import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

const Footer = () => (
  <div
    style={{
      position: "fixed",
      bottom: 10,
      right: 20,
      textAlign: "right",
      fontSize: 12,
      color: "#888", // default text color
    }}
  >
    <Text>
      Developed by{" "}
      <a
        href="https://faculty.sites.iastate.edu/rknelli/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#1677ff", textDecoration: "none" }}
      >
        Nelli Lab
      </a>{" "}
      in collaboration with{" "}
      <a
        href="https://chowdhurylab.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#1677ff", textDecoration: "none" }}
      >
        Chowdhury Lab,
      </a>{" "}

       <a
        href="https://www.iastate.edu/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#A6192E", textDecoration: "none" }}
      >
        Iowa State University
      </a>

    </Text>
  </div>
);

export default Footer;
