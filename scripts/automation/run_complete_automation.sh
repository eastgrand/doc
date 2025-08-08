#!/bin/bash

# Complete ArcGIS to Microservice Automation Pipeline
# Usage: ./run_complete_automation.sh "SERVICE_URL" [PROJECT_NAME]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ASCII Art Banner
echo -e "${BLUE}"
cat << "EOF"
  ╔═══════════════════════════════════════════════════════════╗
  ║              🚀 ArcGIS to Microservice                   ║
  ║                 Automation Pipeline                      ║
  ║                                                          ║
  ║  Transform ArcGIS services to production microservices  ║
  ║              in under 30 minutes!                       ║
  ╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check arguments
if [ $# -lt 1 ]; then
    echo -e "${RED}❌ Error: Service URL is required${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 \"SERVICE_URL\" [PROJECT_NAME]"
    echo ""
    echo -e "${YELLOW}Example:${NC}"
    echo "  $0 \"https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer\" nike_2025"
    exit 1
fi

SERVICE_URL="$1"
PROJECT_NAME="${2:-automated_project_$(date +%Y%m%d_%H%M%S)}"

# Validate service URL
if [[ ! "$SERVICE_URL" =~ ^https?:// ]]; then
    echo -e "${RED}❌ Error: Invalid service URL. Must start with http:// or https://${NC}"
    exit 1
fi

echo -e "${PURPLE}📋 Configuration:${NC}"
echo -e "  🌐 Service URL: ${BLUE}$SERVICE_URL${NC}"
echo -e "  📁 Project Name: ${GREEN}$PROJECT_NAME${NC}"
echo ""

# Check Python availability
echo -e "${YELLOW}🔍 Checking system requirements...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python 3 found${NC}"

# Navigate to automation directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}🏁 Starting Complete Automation Pipeline...${NC}"
echo ""

# Record start time
START_TIME=$(date +%s)

# Run the complete automation pipeline
python3 run_complete_automation.py "$SERVICE_URL" --project "$PROJECT_NAME"

# Check if the pipeline succeeded
if [ $? -eq 0 ]; then
    # Calculate execution time
    END_TIME=$(date +%s)
    EXECUTION_TIME=$((END_TIME - START_TIME))
    MINUTES=$((EXECUTION_TIME / 60))
    SECONDS=$((EXECUTION_TIME % 60))
    
    echo ""
    echo -e "${GREEN}🎉 AUTOMATION PIPELINE COMPLETED SUCCESSFULLY!${NC}"
    echo ""
    echo -e "${PURPLE}📊 Summary:${NC}"
    echo -e "  ⏱️  Execution Time: ${YELLOW}${MINUTES}m ${SECONDS}s${NC}"
    echo -e "  📁 Project Directory: ${BLUE}../../projects/$PROJECT_NAME${NC}"
    echo -e "  📋 Final Report: ${BLUE}../../projects/$PROJECT_NAME/AUTOMATION_REPORT.md${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Next Steps:${NC}"
    echo -e "  1. 🧪 Test the generated endpoints in development"
    echo -e "  2. 🔍 Review the automation report for details"
    echo -e "  3. ✅ Validate layer configurations load correctly"
    echo -e "  4. 🎯 Deploy to production environment"
    echo ""
    echo -e "${GREEN}✨ Your ArcGIS service has been transformed into a production-ready microservice!${NC}"
    
else
    echo ""
    echo -e "${RED}❌ AUTOMATION PIPELINE FAILED${NC}"
    echo -e "${YELLOW}📋 Check the logs in: ../../projects/$PROJECT_NAME/automation_pipeline_*.log${NC}"
    exit 1
fi