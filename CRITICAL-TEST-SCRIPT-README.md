# 🚨 CRITICAL TEST SCRIPT - PRESERVATION NOTICE 🚨

## Important Files to NEVER Delete

### `__tests__/query-to-visualization-pipeline.test.ts`

**Status**: 🔴 CRITICAL INFRASTRUCTURE - DO NOT DELETE

This comprehensive test script is **essential for project integrity** and must be preserved across:
- All code refactoring
- Project restructuring  
- Dependency updates
- Team transitions
- Framework migrations

## Why This Test Is Critical

### 1. **Comprehensive Pipeline Validation**
- Tests the COMPLETE query-to-visualization flow (10+ steps)
- Validates ALL queries from production categories (22+ types)
- Catches integration issues before they reach production

### 2. **Significant Development Investment**
- Represents weeks of development work
- Contains complex validation logic for analysis quality
- Includes robust error handling and troubleshooting
- Provides detailed performance metrics and reporting

### 3. **Production Safety Net**
- Prevents deployment of broken query routing
- Validates field mappings and data consistency
- Ensures visualization accuracy and legend correctness
- Catches configuration mismatches early

### 4. **Troubleshooting Infrastructure**
- Generates detailed reports for debugging issues
- Provides performance baselines for optimization
- Offers actionable recommendations for improvements
- Creates historical tracking for regression analysis

## When to Run This Test

### 🔄 **Before Every Deployment**
```bash
npm test query-to-visualization-pipeline.test.ts -- --verbose
```

### 📅 **Required Scenarios**
- [ ] Before production releases
- [ ] After query routing changes
- [ ] When adding new analysis categories
- [ ] After updating brand configurations
- [ ] When modifying visualization components
- [ ] During major dependency updates
- [ ] After database schema changes
- [ ] When updating field mappings

## Test Output

### Generated Reports
```
query-to-visualization-test-results-[timestamp].json  # Machine-readable data
query-to-visualization-test-results-[timestamp].md    # Human-readable report
```

### Key Metrics Tracked
- Query routing accuracy (semantic vs keyword vs fallback)
- Processing performance (timing for each pipeline step)
- Data quality validation (score distributions, field consistency)
- Visualization accuracy (legend correctness, color schemes)
- Error analysis (detailed troubleshooting information)

## Maintenance Guidelines

### 1. **Keep Queries Updated**
Update `components/chat/chat-constants.ts` when adding new analysis types:
```typescript
export const ANALYSIS_CATEGORIES = {
  'New Analysis Type': [
    'Example query for new analysis type'
  ],
  // ... existing categories
};
```

### 2. **Update Expected Endpoints**
Maintain endpoint mappings in the test when adding new endpoints:
```typescript
const categoryEndpointMap: Record<string, string> = {
  'New Analysis Type': '/new-analysis-endpoint',
  // ... existing mappings
};
```

### 3. **Extend Validation Functions**
Add new validation criteria as the pipeline evolves:
- Update `validateAnalysisQuality()` for new data requirements
- Enhance `validateLegendAccuracy()` for new visualization types
- Extend error handling for new failure modes

## Code Review Requirements

### ✅ **Required Approvals**
Any changes to this test script require:
- Senior developer review
- QA team approval
- Product owner sign-off (for query changes)

### 🚫 **Prohibited Actions**
- Deleting the test file
- Commenting out test cases
- Reducing test coverage
- Removing error handling
- Simplifying validation logic

## Team Knowledge Transfer

### 📚 **Documentation**
- Test methodology documented in `/docs/QUERY_TO_VISUALIZATION_TESTING_CHECKLIST.md`
- Pipeline architecture documented in `/docs/QUERY_TO_VISUALIZATION_FLOW.md`
- Results interpretation guide in test comments

### 🎓 **Training Requirements**
New team members must:
1. Understand the complete pipeline architecture
2. Know how to run and interpret test results
3. Be familiar with troubleshooting common issues
4. Practice updating test scenarios

## Backup and Recovery

### 📁 **Version Control**
- Keep this test in primary branch protection
- Tag major versions for rollback capability
- Maintain test history for regression analysis

### 💾 **Backup Strategy**
- Include test script in critical file backups
- Preserve test reports for historical analysis
- Document any test modifications in commit messages

## Emergency Procedures

### 🚨 **If Test Is Accidentally Deleted**
1. **Immediate Recovery**: Restore from git history
2. **Validation**: Run recovered test to ensure integrity
3. **Documentation**: Update this README with lessons learned
4. **Prevention**: Review access controls and backup procedures

### 📞 **Contact Information**
For questions about this test script:
- Technical Lead: [Add contact info]
- QA Team: [Add contact info]  
- DevOps: [Add contact info]

---

## Summary

This test script is **critical infrastructure** that ensures the reliability and quality of the query-to-visualization pipeline. Treat it with the same care as production code and database schemas. 

**Remember**: A few minutes running this test can prevent hours of production debugging.

**Last Updated**: January 2025  
**Next Review**: [Add date]  
**Maintainer**: [Add team/person]