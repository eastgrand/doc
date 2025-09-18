#!/bin/bash
echo "🔧 Comprehensive TypeScript element type fixes..."

# Fix all input elements that were incorrectly typed as HTMLSelectElement
find components -name "*.tsx" | while read -r file; do
  # Check if the file contains input elements that might have been incorrectly typed
  if grep -q "type=\"text\"\|type=\"password\"\|type=\"email\"\|type=\"number\"\|type=\"checkbox\"\|type=\"radio\"\|type=\"search\"" "$file"; then
    sed -i '' 's/onChange={(e: React.ChangeEvent<HTMLSelectElement>)/onChange={(e: React.ChangeEvent<HTMLInputElement>)/g' "$file"
  fi
  
  # Check if the file contains textarea elements that might have been incorrectly typed
  if grep -q "<textarea\|<Textarea\|rows=" "$file"; then
    # Only fix if it's not already correctly typed as HTMLTextAreaElement
    if ! grep -q "React.ChangeEvent<HTMLTextAreaElement>" "$file"; then
      sed -i '' 's/onChange={(e: React.ChangeEvent<HTMLInputElement>)/onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)/g' "$file"
    fi
  fi
done

echo "✅ Comprehensive TypeScript element type fixes applied!"