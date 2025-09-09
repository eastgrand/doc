#!/bin/bash

# Test script to fetch and display available reports using curl
TOKEN="AAPTxy8BH1VEsoebNVZXo8HurEs9TD-3BH9IvorrjVWQR4uGhbHZOyV9S-QJcwJfNyPyN6IDTc6dX1pscXuVgb4-GEQ70Mrk6FUuIcuO2Si45rlSIepAJkP92iyuw5nBPxpTjI0ga_Aau9Cr6xaQ2DJnJfzaCkTor0cB9UU6pcNyFqxJlYt_26boxHYqnnu7vWlqt7SVFcWKmYq6kh8anIAmEi0hXY1ThVhKIupAS_Mure0.AT1_VqzOv0Y5"

echo "🔍 TESTING REPORT DISCOVERY..."
echo ""

# Test Synapse54 content
echo "📡 Testing: Synapse54 Report Templates"
SYNAPSE_URL="https://www.arcgis.com/sharing/rest/search?q=owner:Synapse54%20AND%20type:\"Report%20Template\"&f=pjson&token=${TOKEN}&num=50"

echo "Making request to ArcGIS API..."
curl -s "$SYNAPSE_URL" | jq -r '
.results[] | 
"📄 \(.title // "Untitled")
   ID: \(.id)
   Owner: \(.owner // "Unknown")  
   Type: \(.type // "Unknown")
   Modified: \(.modified // "Unknown")
   Description: \((.snippet // .description // "No description")[0:100])...
"'

echo ""
echo "📡 Testing: PRIZM Reports"
PRIZM_URL="https://www.arcgis.com/sharing/rest/search?q=type:\"Report%20Template\"%20AND%20(PRIZM%20OR%20prizm%20OR%20Tapestry)&f=pjson&token=${TOKEN}&num=50"

curl -s "$PRIZM_URL" | jq -r '
.results[] | 
"🎯 \(.title // "Untitled")
   ID: \(.id)
   Owner: \(.owner // "Unknown")
   Description: \((.snippet // .description // "No description")[0:100])...
"'

echo ""
echo "📡 Testing: Canadian Reports" 
CANADIAN_URL="https://www.arcgis.com/sharing/rest/search?q=type:\"Report%20Template\"%20AND%20(canada%20OR%20canadian%20OR%20quebec)&f=pjson&token=${TOKEN}&num=50"

curl -s "$CANADIAN_URL" | jq -r '
.results[] | 
"🍁 \(.title // "Untitled")
   ID: \(.id) 
   Owner: \(.owner // "Unknown")
   Description: \((.snippet // .description // "No description")[0:100])...
"'

echo ""
echo "📡 Testing: All Report Templates (limited sample)"
ALL_URL="https://www.arcgis.com/sharing/rest/search?q=type:\"Report%20Template\"&f=pjson&token=${TOKEN}&num=20&sortField=title&sortOrder=asc"

echo "Sample of all available report templates:"
curl -s "$ALL_URL" | jq -r '
"Total found: \(.total // 0)
First \(.results | length) results:
" +
(.results[] | 
"• \(.title // "Untitled") (owner: \(.owner // "Unknown"))")
'