#!/bin/bash
echo "🎯 Smart TypeScript element type detection and fixing..."

# Process all tsx files to fix select elements that were incorrectly typed as input
find components -name "*.tsx" -exec grep -l "<select" {} \; | while read -r file; do
  # Fix select elements that have HTMLInputElement typing
  sed -i '' 's/onChange={(e: React.ChangeEvent<HTMLInputElement>) => set\([A-Za-z]*\)(/onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set\1(/g' "$file"
  echo "Fixed select elements in $file"
done

# Process all tsx files to fix textarea elements that were incorrectly typed as input
find components -name "*.tsx" -exec grep -l "rows=\|<textarea" {} \; | while read -r file; do
  # Fix textarea elements that have HTMLInputElement typing (but avoid those already correct)
  if ! grep -q "React.ChangeEvent<HTMLTextAreaElement>" "$file"; then
    sed -i '' 's/onChange={(e: React.ChangeEvent<HTMLInputElement>)/onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)/g' "$file"
    echo "Fixed textarea elements in $file"
  fi
done

echo "✅ Smart TypeScript element type fixes applied!"