#!/bin/bash

# Fix implicit any parameter types in geospatial-chat-interface.tsx
file="components/geospatial-chat-interface.tsx"

# Fix setMessages callbacks
sed -i '' 's/setMessages(prev =>/setMessages((prev: LocalChatMessage[]) =>/g' "$file"

# Fix setProcessingSteps callbacks  
sed -i '' 's/setProcessingSteps(prev =>/setProcessingSteps((prev: GeoProcessingStep[]) =>/g' "$file"

echo "Fixed callback types in $file"