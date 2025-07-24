import pandas as pd
import string

# Create an empty DataFrame
df = pd.DataFrame()

# Generate columns A to P
rows = list(string.ascii_uppercase[:16])  # A to P

# Populate DataFrame with values like A1, A2, ..., P24
for row in rows:
    df[row] = [f"{row}{i}" for i in range(1, 25)]  # 1 to 24

# Export to Excel
df.to_excel("384-position-B.xlsx", index=False)
print("Excel file '384position.xlsx' has been created.")
