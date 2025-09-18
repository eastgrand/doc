#!/bin/bash

# Fix setFilterGroups implicit any parameter types in FilterWidget.tsx
file="components/FilterWidget.tsx"

# Fix setFilterGroups callbacks
sed -i '' 's/setFilterGroups(prev =>/setFilterGroups((prev: FilterGroup[]) =>/g' "$file"

echo "Fixed setFilterGroups callbacks in $file"