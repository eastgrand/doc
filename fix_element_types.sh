#!/bin/bash
echo "🔧 Fixing remaining element-specific TypeScript typing issues..."

# Fix textarea onChange events (previously incorrectly typed as HTMLInputElement)
find components -name "*.tsx" -exec grep -l '<textarea\|<Textarea\|rows=' {} \; | xargs sed -i '' 's/onChange={(e: React.ChangeEvent<HTMLInputElement>)/onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)/g'

# Fix select onChange events (previously incorrectly typed as HTMLInputElement)
find components -name "*.tsx" -exec grep -l '<select\|<Select' {} \; | xargs sed -i '' 's/onChange={(e: React.ChangeEvent<HTMLInputElement>)/onChange={(e: React.ChangeEvent<HTMLSelectElement>)/g'

echo "✅ Element-specific TypeScript fixes applied!"