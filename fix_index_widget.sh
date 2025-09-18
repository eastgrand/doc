#!/bin/bash

# Fix implicit any parameter types in IndexWidget.tsx
file="components/IndexWidget.tsx"

# Fix setSelectedFields callbacks
sed -i '' 's/setSelectedFields(prev =>/setSelectedFields((prev: Variable[]) =>/g' "$file"

# Fix onChange Input callbacks
sed -i '' 's/onChange={(e) =>/onChange={(e: React.ChangeEvent<HTMLInputElement>) =>/g' "$file"

echo "Fixed callback types in $file"