import pandas as pd
import json

# Load Excel file
df = pd.read_excel("SmartChip_layout_template.xlsx")

df["Assay"] = df["Assay"].astype(str).str.upper().str.replace(r"\s+", "", regex=True)
df = df[df["Assay"] == "PRRSV"]
print("Unique assay values:", df["Assay"].unique())

# Check required columns
required_cols = {"Row.No", "Column no"}
if not required_cols.issubset(df.columns):
    raise ValueError(f"Missing required columns: {required_cols - set(df.columns)}")

# Build position map
well_position_map = {}
for _, row in df.iterrows():
    row_no = int(row["Row.No"])
    col_no = int(row["Column no"])
    key = f"{row_no}_{col_no}"
    well_position_map[key] = [row_no, col_no]

# Save JSON
with open("SmartChip_position_map.json", "w") as f:
    json.dump(well_position_map, f, indent=2)

print(f"Generated {len(well_position_map)} PRRSV-only well-position mappings.")
