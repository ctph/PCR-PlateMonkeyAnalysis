import React from "react";
import { Select } from "antd";

const { Option } = Select;

const TargetFilter384 = ({ selectedTarget, setSelectedTarget }) => {
  const fixedTargets = ["ALL", "NA", "EU", "XENO", "IAV", "Mgene", "XIPC"];

  return (
    <div style={{ marginBottom: 20 }}>
      <h4>Filter by Target</h4>
      <Select
        value={selectedTarget}
        onChange={setSelectedTarget}
        placeholder="Select Target"
        style={{ width: 200 }}
      >
        {fixedTargets.map((target) => (
          <Option key={target} value={target}>
            {target}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default TargetFilter384;
