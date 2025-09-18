#!/bin/bash

# Fix implicit any parameter types in LayerBookmarks.tsx
file="components/LayerBookmarks.tsx"

# Fix onClick handlers (assuming Material-UI Button/IconButton)
sed -i '' 's/onClick={(e) =>/onClick={(e: React.MouseEvent<HTMLButtonElement>) =>/g' "$file"

# Fix onChange Input callbacks
sed -i '' 's/onChange={(e) =>/onChange={(e: React.ChangeEvent<HTMLInputElement>) =>/g' "$file"

# Also fix setFormData callbacks that might have implicit any
sed -i '' 's/setFormData(prev =>/setFormData((prev: any) =>/g' "$file"

echo "Fixed callback types in $file"