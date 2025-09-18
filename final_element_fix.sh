#!/bin/bash
echo "🎯 Final comprehensive TypeScript element type fixes..."

# Save current directory
original_dir=$(pwd)

# Function to fix a single file
fix_file() {
  local file="$1"
  echo "Processing $file..."
  
  # Read the file line by line and check for select elements followed by onChange
  local in_select_block=false
  local temp_file="${file}.tmp"
  
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ $line =~ \<select ]]; then
      in_select_block=true
      echo "$line" >> "$temp_file"
    elif [[ $line =~ \</select\> ]]; then
      in_select_block=false
      echo "$line" >> "$temp_file"
    elif $in_select_block && [[ $line =~ onChange.*HTMLInputElement ]]; then
      # This is a select element with incorrect HTMLInputElement typing
      fixed_line=$(echo "$line" | sed 's/React.ChangeEvent<HTMLInputElement>/React.ChangeEvent<HTMLSelectElement>/g')
      echo "$fixed_line" >> "$temp_file"
    elif [[ $line =~ \<input ]] || [[ $line =~ type=\"(text|number|email|password|search|url|tel|checkbox|radio|color|date|datetime-local|file|hidden|month|range|time|week)\" ]]; then
      # This is an input element - make sure it uses HTMLInputElement
      if [[ $line =~ onChange.*HTMLSelectElement ]]; then
        fixed_line=$(echo "$line" | sed 's/React.ChangeEvent<HTMLSelectElement>/React.ChangeEvent<HTMLInputElement>/g')
        echo "$fixed_line" >> "$temp_file"
      else
        echo "$line" >> "$temp_file"
      fi
    elif [[ $line =~ \<textarea ]] || [[ $line =~ rows= ]]; then
      # This is a textarea element - make sure it uses HTMLTextAreaElement
      if [[ $line =~ onChange.*HTMLInputElement ]] || [[ $line =~ onChange.*HTMLSelectElement ]]; then
        fixed_line=$(echo "$line" | sed 's/React.ChangeEvent<HTML[A-Za-z]*Element>/React.ChangeEvent<HTMLTextAreaElement>/g')
        echo "$fixed_line" >> "$temp_file"
      else
        echo "$line" >> "$temp_file"
      fi
    else
      echo "$line" >> "$temp_file"
    fi
  done < "$file"
  
  # Replace the original file
  mv "$temp_file" "$file"
  echo "Fixed $file"
}

# Process all tsx files
find components -name "*.tsx" | while read -r file; do
  if [[ -f "$file" ]]; then
    fix_file "$file"
  fi
done

echo "✅ Final comprehensive TypeScript element type fixes completed!"