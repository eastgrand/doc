#!/bin/bash
echo "🎯 Targeted select element fixes..."

# Fix specific files that have select elements
files_with_selects=(
  "components/CorrelationMapControls.tsx"
  "components/FilterWidget.tsx" 
  "components/clustering/TerritorySummaryCards.tsx"
  "components/unified-analysis/UnifiedAnalysisWorkflow.tsx"
  "components/phase4/ScholarlyResearchPanel.tsx"
)

for file in "${files_with_selects[@]}"; do
  if [[ -f "$file" ]]; then
    echo "Fixing select elements in $file"
    # Use awk to fix onChange within select blocks
    awk '
    /<select/ { in_select = 1 }
    in_select && /onChange.*HTMLInputElement/ { 
      gsub(/React\.ChangeEvent<HTMLInputElement>/, "React.ChangeEvent<HTMLSelectElement>")
    }
    /<\/select>/ { in_select = 0 }
    { print }
    ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
  fi
done

echo "✅ Targeted select element fixes completed!"