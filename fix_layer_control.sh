#!/bin/bash

# Fix implicit any parameter types in LayerControl.tsx
file="components/LayerControl.tsx"

# Fix setLayerStates callbacks
sed -i '' 's/setLayerStates(prev =>/setLayerStates((prev: Record<string, LayerState>) =>/g' "$file"

echo "Fixed setLayerStates callbacks in $file"