#!/bin/bash

# Fix common TypeScript implicit any parameter errors in event handlers
files=(
    "components/filtering/tabs/FieldFilterTab.tsx"
    "components/filtering/tabs/PerformanceTab.tsx"
    "components/filtering/tabs/VisualizationTab.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        # Fix onCheckedChange Switch callbacks  
        sed -i '' 's/onCheckedChange={(enabled) =>/onCheckedChange={(enabled: boolean) =>/g' "$file"
        sed -i '' 's/onCheckedChange={(checked) =>/onCheckedChange={(checked: boolean) =>/g' "$file" 
        sed -i '' 's/onCheckedChange={(caseSensitive) =>/onCheckedChange={(caseSensitive: boolean) =>/g' "$file"

        # Fix onChange Input callbacks
        sed -i '' 's/onChange={(e) =>/onChange={(e: React.ChangeEvent<HTMLInputElement>) =>/g' "$file"

        # Fix onValueChange Slider callbacks  
        sed -i '' 's/onValueChange={(value) =>/onValueChange={(value: number[]) =>/g' "$file"

        echo "Fixed event handler types in $file"
    else
        echo "File $file not found"
    fi
done