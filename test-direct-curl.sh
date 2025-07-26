#!/bin/bash

echo "🔍 TESTING ACTUAL API WITH CURL"
echo "============================================================"

echo -e "\n📊 TESTING STRATEGIC ANALYSIS"

# Test strategic analysis
curl -X POST http://localhost:3000/api/claude/generate-response \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Show me the top strategic markets for Nike expansion"
      }
    ],
    "metadata": {
      "query": "Show me the top strategic markets for Nike expansion"
    },
    "featureData": [
      {
        "layerId": "test",
        "layerName": "Test Layer",
        "features": [
          {
            "properties": {
              "area_name": "Test Area 1",
              "strategic_value_score": 79.34,
              "value_MP30034A_B_P": 17.7,
              "target_value": 79.34
            }
          },
          {
            "properties": {
              "area_name": "Test Area 2", 
              "strategic_value_score": 78.5,
              "value_MP30034A_B_P": 15.2,
              "target_value": 78.5
            }
          }
        ]
      }
    ]
  }' \
  2>/dev/null | head -20

echo -e "\n\n✅ Test complete"