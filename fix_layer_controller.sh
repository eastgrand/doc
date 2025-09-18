#!/bin/bash

# Fix implicit any parameter types in LayerController.tsx
file="components/LayerController.tsx"

# Fix setLayerStates callbacks
sed -i '' 's/setLayerStates(prev =>/setLayerStates((prev: Record<string, any>) =>/g' "$file"

echo "Fixed setLayerStates callbacks in $file"