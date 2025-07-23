import React from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const DownloadButton = ({filepath}) => {
  return (
    <a href={filepath} download>
      <Button type="primary" icon={<DownloadOutlined />}>
        Download Template
      </Button>
    </a>
  );
};

export default DownloadButton;