#!/bin/bash

echo "=== TESTING STRATEGIC ANALYSIS API WITH CURL ==="
echo ""

echo "📡 Making strategic analysis request..."

curl -X POST http://localhost:3000/api/claude/generate-response \
  -H "Content-Type: application/json" \
  -d '{"query":"Show me strategic markets for Nike expansion","analysisType":"strategic_analysis"}' \
  --max-time 30 \
  --silent \
  --show-error \
  | jq -r '
    if .error then
      "❌ API Error: " + .error
    else
      "✅ API Response received!\n" +
      "📊 Visualization Data Type: " + (.visualizationData.type // "none") + "\n" +
      "📊 Records Count: " + (.visualizationData.records | length | tostring) + "\n" +
      "📊 Target Variable: " + (.visualizationData.targetVariable // "none") + "\n" +
      "🎨 Renderer Type: " + (.visualizationResult.type // "none") + "\n" +
      "🎨 Renderer Field: " + (.visualizationResult.renderer.field // "none") + "\n" +
      "🎨 Config Value Field: " + (.visualizationResult.config.valueField // "none") + "\n" +
      "🎨 Class Breaks: " + (.visualizationResult.config.classBreaks | tostring)
    end
  '