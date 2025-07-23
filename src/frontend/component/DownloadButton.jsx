import React from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const DownloadButton = () => {
  return (
    <a href="/example.pdf" download>
      <Button type="primary" icon={<DownloadOutlined />}>
        Download Template
      </Button>
    </a>
  );
};

export default DownloadButton;


