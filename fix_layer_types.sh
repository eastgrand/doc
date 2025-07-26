#!/bin/bash
# Fix TypeScript errors in config/layers.ts by replacing 'amount' with 'index'

# Get the absolute path to the file
FILE_PATH="/Users/voldeck/code/newdemo/config/layers.ts"

# Use sed to replace all instances of type: 'amount' with type: 'index'
sed -i '' "s/type: 'amount'/type: 'index'/g" "$FILE_PATH"

echo "Replacement completed. All instances of type: 'amount' have been replaced with type: 'index'."
