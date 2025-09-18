#!/bin/bash
echo "🔧 Fixing TypeScript parameter types automatically..."

# Fix common callback parameter patterns
find components -name "*.tsx" -exec sed -i '' 's/onChange={(e) =>/onChange={(e: React.ChangeEvent<HTMLInputElement>) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/onChange={(e) =>/onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/onClick={(e) =>/onClick={(e: React.MouseEvent) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/onCheckedChange={(checked) =>/onCheckedChange={(checked: boolean) =>/g' {} \;

# Fix setState callback patterns
find components -name "*.tsx" -exec sed -i '' 's/setState(prev =>/setState((prev: any) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setExpandedGroups(prev =>/setExpandedGroups((prev: Set<string>) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setLayerStates(prev =>/setLayerStates((prev: Record<string, any>) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setConnections(prev =>/setConnections((prev: any[]) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setConcepts(prev =>/setConcepts((prev: any[]) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setFeatureLayers(prev =>/setFeatureLayers((prev: __esri.FeatureLayer[]) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setStreams(prev =>/setStreams((prev: any[]) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setLayers(prev =>/setLayers((prev: any[]) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setComponentStatuses(prev =>/setComponentStatuses((prev: any[]) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setSuggestions(prev =>/setSuggestions((prev: any[]) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setTestResults(prev =>/setTestResults((prev: any) =>/g' {} \;
find components -name "*.tsx" -exec sed -i '' 's/setDragState(prev =>/setDragState((prev: any) =>/g' {} \;

echo "✅ Automated TypeScript fixes applied!"