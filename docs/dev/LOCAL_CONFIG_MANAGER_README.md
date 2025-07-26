# Local Project Configuration Manager

## Overview
The Project Configuration Manager is a local development tool that allows you to manage layer configurations, concept mappings, and project settings through a web interface. This tool is **only accessible in development environments** for security reasons.

## 🚀 Quick Start

### Option 1: Using the Startup Script
```bash
./scripts/start-config-manager.sh
```

### Option 2: Manual Start
```bash
npm run dev
# Then navigate to http://localhost:3000/admin/project-config
```

## 🔒 Security Features

- **Development Only**: Only accessible when `NODE_ENV=development` or on localhost
- **No Production Access**: Automatically blocked in production environments
- **Local File System**: Direct access to configuration files for immediate changes
- **Automatic Backups**: Creates timestamped backups before any changes

## 📋 Features

### 1. **Current Configuration Import**
- Automatically imports your existing layer configuration from `config/layers.ts`
- Converts to the enhanced project configuration format
- Preserves all existing layer metadata and settings

### 2. **Visual Layer Management**
- View all layers in an organized interface
- Edit layer properties, URLs, and metadata
- Manage layer groups and visibility settings
- Real-time validation of changes

### 3. **Concept Mapping Editor**
- Manage concept-to-layer mappings
- Edit field mappings for query processing
- Configure synonyms and weights
- Export/import concept map configurations

### 4. **Dependency Analysis**
- Scans your codebase for layer references
- Identifies files that need updates
- Shows impact analysis for configuration changes
- Provides update recommendations

### 5. **File Generation**
- Automatically generates new `config/layers.ts`
- Creates `config/concept-map.json` for concept mappings
- Maintains TypeScript type safety
- Preserves utility functions and exports

## 🛠️ How It Works

### Reading Current Configuration
```typescript
// The local manager reads from:
- config/layers.ts          // Layer definitions
- config/concept-map.json   // Concept mappings (if exists)
- lib/concept-mapping.ts    // Concept mapping logic
```

### Writing New Configuration
```typescript
// Updates these files:
- config/layers.ts          // New layer configuration
- config/concept-map.json   // Updated concept mappings
- backups/config_[timestamp]/ // Backup of original files
```

### File Structure After Changes
```
config/
├── layers.ts              # Auto-generated with header comment
├── concept-map.json       # JSON concept mappings
└── layers.ts.backup.*     # Timestamped backups

backups/
└── config_[timestamp]/    # Full backup directory
    ├── layers.ts
    ├── concept-map.json
    └── concept-mapping.ts
```

## 🎯 Usage Workflow

### 1. **Initial Setup**
```bash
# Start the development server
./scripts/start-config-manager.sh

# Navigate to admin interface
open http://localhost:3000/admin/project-config
```

### 2. **Import Current Configuration**
- Click "Import Current Configuration" in the interface
- Review the imported layers and settings
- Make any necessary adjustments

### 3. **Make Changes**
- Edit layer properties in the Layer Configuration tab
- Update concept mappings in the Concept Mapping tab
- Adjust global settings and preferences

### 4. **Deploy Changes**
- Click "Deploy Configuration"
- Review the impact analysis
- Confirm deployment to update files

### 5. **Verify Changes**
- Check the updated `config/layers.ts` file
- Restart your development server to load new configuration
- Test your application with the new settings

## 🔧 Advanced Features

### Template Management
- Save current configuration as a template
- Create new projects from templates
- Share templates with team members

### Validation & Testing
- Real-time validation of layer URLs
- Field mapping verification
- Dependency conflict detection

### Rollback Capabilities
- Automatic backup creation
- One-click rollback to previous versions
- Backup file management

## 🚨 Important Notes

### File Modifications
- The tool **directly modifies** your configuration files
- Always commit your changes to version control before using
- Backups are created automatically but should not be your only safety net

### Development Only
- This tool is intentionally restricted to development environments
- It will not work in production deployments
- Use environment variables to control access if needed

### TypeScript Compatibility
- Generated files maintain full TypeScript compatibility
- All existing imports and exports are preserved
- Type definitions are automatically updated

## 🔍 Troubleshooting

### Access Denied
```
Problem: "Access Restricted" message
Solution: Ensure you're running in development mode (NODE_ENV=development)
```

### File Permission Errors
```
Problem: Cannot write to configuration files
Solution: Check file permissions and ensure you're running from the project root
```

### Import Errors
```
Problem: Current configuration import fails
Solution: Verify config/layers.ts exists and is valid TypeScript
```

### Backup Issues
```
Problem: Backup creation fails
Solution: Ensure write permissions to the project directory
```

## 📊 Next Steps

Once you're comfortable with the local configuration manager:

1. **Phase 2**: Implement advanced layer editor with drag-and-drop
2. **Phase 3**: Add smart dependency scanning and auto-updates
3. **Phase 4**: Build live preview system for configuration changes
4. **Phase 5**: Add collaborative features and team management

## 🤝 Contributing

This is a development tool for your specific project. Modify the components in:
- `components/ProjectConfigManager/` - UI components
- `services/local-config-manager.ts` - Core logic
- `pages/admin/project-config.tsx` - Main admin page

## 📝 License

This tool is part of your project and follows the same licensing as your main application. 