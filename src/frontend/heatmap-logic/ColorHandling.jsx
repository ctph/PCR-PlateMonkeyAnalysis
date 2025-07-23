import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { Button, InputNumber, message, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';

const ColorHandling = ({ colorRanges, setColorRanges, dataMax = 40 }) => {
  const [nextId, setNextId] = useState(0);

  const addColorRange = () => {
    const newId = nextId;
    setNextId(newId + 1);
    
    setColorRanges(prev => [
      ...prev,
      {
        id: newId,
        color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
        min: 0,
        max: dataMax,
        locked: true // New ranges start locked at full range
      }
    ]);
  };

  const updateRange = (key, value, id) => {
    setColorRanges(prev => 
      prev.map(range => {
        if (range.id !== id) return range;
        
        // Don't update if locked (except when unlocking)
        if (range.locked && key !== 'locked') return range;
        
        const numValue = Number(value);
        if (isNaN(numValue)) return range;
        
        const updated = { ...range };
        
        if (key === 'min') {
          updated.min = Math.max(0, Math.min(range.max, numValue));
        } 
        else if (key === 'max') {
          updated.max = Math.min(dataMax, Math.max(range.min, numValue));
        }
        else if (key === 'locked') {
          updated.locked = value;
        }
        
        return updated;
      })
    );
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        {colorRanges.map(range => (
          <div key={range.id} style={{ textAlign: "center", border: "1px solid #ddd", padding: 10 }}>
            <SketchPicker
              color={range.color}
              onChangeComplete={color => updateRange('color', color, range.id)}
              width="200px"
            />
            
            <div style={{ marginTop: 10 }}>
              <Switch
                checkedChildren={<UnlockOutlined />}
                unCheckedChildren={<LockOutlined />}
                checked={!range.locked}
                onChange={checked => updateRange('locked', !checked, range.id)}
                style={{ marginBottom: 8 }}
              />
              
              <div>
                <span>Min: </span>
                <InputNumber
                  value={range.min}
                  onChange={val => updateRange('min', val, range.id)}
                  disabled={range.locked}
                  min={0}
                  max={range.max}
                  step={0.1}
                  style={{ width: 80 }}
                />
              </div>
              
              <div style={{ marginTop: 5 }}>
                <span>Max: </span>
                <InputNumber
                  value={range.max}
                  onChange={val => updateRange('max', val, range.id)}
                  disabled={range.locked}
                  min={range.min}
                  max={dataMax}
                  step={0.1}
                  style={{ width: 80 }}
                />
              </div>
              
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  if (colorRanges.length <= 1) {
                    message.warning("At least one color range must remain");
                    return;
                  }
                  setColorRanges(prev => prev.filter(r => r.id !== range.id));
                }}
                style={{ marginTop: 10 }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Button 
          type="dashed" 
          icon={<PlusOutlined />} 
          onClick={addColorRange}
        >
          Add Color Range (Locked at 0-{dataMax} by default)
        </Button>
      </div>
    </div>
  );
};

export default ColorHandling;