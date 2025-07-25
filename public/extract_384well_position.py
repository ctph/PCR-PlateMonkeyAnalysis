import pandas as pd
import json

# Load Excel data (with header inferred)
df = pd.read_excel("384-well_layout_template.xlsx")

# Check that required columns exist
required_cols = {"Well no", "Row.No", "Column no"}
if not required_cols.issubset(df.columns):
    raise ValueError(f"Missing required columns: {required_cols - set(df.columns)}")

# Create mapping: WellLabel_Row_Col → [Row.No, Column no]
well_position_map = {}

for _, row in df.iterrows():
    well = str(row["Well no"]).strip()
    row_no = int(row["Row.No"])
    col_no = int(row["Column no"])
    key = f"{well}_{row_no}_{col_no}"  
    well_position_map[key] = [row_no, col_no]

# Save to JSON
with open("384position_map.json", "w") as f:
    json.dump(well_position_map, f, indent=2)

print(f"Generated {len(well_position_map)} well-position mappings.")
