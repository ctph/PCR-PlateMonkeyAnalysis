import React, { useState } from "react";
import { message } from "antd";

const FileUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploaded(false);

    try {
      // Example: simulate upload
      const formData = new FormData();
      formData.append("file", file);

      await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      setUploaded(true);
      message.success("✅ File uploaded successfully!");
    } catch (err) {
      message.error("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} disabled={uploading} />
      {uploaded && <p style={{ color: "green" }}>File uploaded successfully!</p>}
    </div>
  );
};

export default FileUploader;
