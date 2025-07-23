import React, { useRef } from "react";
import { Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const UploadButton = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      onFileSelect(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button type="primary" icon={<UploadOutlined />} onClick={handleClick}>
        Upload CSV
      </Button>
    </>
  );
};

export default UploadButton;
