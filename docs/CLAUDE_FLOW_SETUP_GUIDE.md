# Claude-Flow Setup Guide

> **Complete guide for installing and configuring claude-flow for AI-accelerated development**  
> **Expected Benefits**: 75% development time reduction, automated code generation, intelligent workflows

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Process](#installation-process)
- [Troubleshooting](#troubleshooting)
- [Project Initialization](#project-initialization)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Integration with Existing Projects](#integration-with-existing-projects)
- [Best Practices](#best-practices)

---

## 🔧 Prerequisites

### System Requirements
- **Node.js**: v20.x or v22.x (⚠️ **NOT v24+** due to native module compatibility)
- **npm**: v9.x or v10.x
- **Operating System**: macOS, Linux, or Windows with WSL
- **Memory**: Minimum 8GB RAM (16GB recommended for large projects)

### Required Tools
```bash
# Node Version Manager (nvm) - Recommended for version switching
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Git (for project management)
git --version

# Python 3.8+ (for some native dependencies)
python3 --version
```

---

## 🚀 Installation Process

### Step 1: Node.js Version Setup

The **critical step** - claude-flow requires Node v20 or v22, not v24+.

```bash
# Check current Node version
node --version

# If you have Node v24+, install Node v20
nvm install 20.19.4
nvm use 20.19.4

# Verify the switch
node --version  # Should show v20.19.4
```

### Step 2: Install Claude-Flow

Choose one of these installation methods:

#### Option A: Local Project Installation (Recommended)
```bash
# In your project directory
npm install --save-dev claude-flow@2.0.1

# Verify installation
npx claude-flow --version
```

#### Option B: Global Installation
```bash
# Install globally (requires Node v20 in PATH)
npm install -g claude-flow@2.0.1

# Verify installation
claude-flow --version
```

### Step 3: Project Initialization

```bash
# Navigate to your project directory
cd /path/to/your/project

# Initialize claude-flow with project type
npx claude-flow init --project-type="your-project-type" --integration="hybrid"

# Available project types:
# - geospatial-analysis
# - web-development
# - data-science
# - api-development
# - full-stack
```

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### Issue 1: Native Module Compilation Errors
```
Error: `make` failed with exit code: 69
gyp ERR! build error
```

**Solution**: Use Node v20 instead of v24+
```bash
nvm install 20.19.4
nvm use 20.19.4
npm install claude-flow@2.0.1
```

#### Issue 2: Xcode License Agreements (macOS)
```
You have not agreed to the Xcode license agreements
```

**Solution A**: Accept Xcode license (if you have Xcode)
```bash
sudo xcodebuild -license accept
```

**Solution B**: Use Node v20 (bypasses some native compilation)
```bash
nvm use 20.19.4
npm install claude-flow@2.0.1
```

#### Issue 3: Better-SQLite3 Compilation Issues
```
prebuild-install warn install No prebuilt binaries found
```

**Solution**: Install with specific Node version
```bash
# Clear npm cache
npm cache clean --force

# Use Node v20 explicitly
PATH=~/.nvm/versions/node/v20.19.4/bin:$PATH npm install claude-flow@2.0.1
```

#### Issue 4: Existing claude-flow Directory Conflict
```
Failed to initialize Claude Flow: EISDIR: illegal operation on a directory
```

**Solution**: Rename existing directory
```bash
mv claude-flow claude-flow-backup
npx claude-flow init --project-type="your-type"
```

---

## 📁 Project Initialization

### Basic Initialization
```bash
# Standard initialization
npx claude-flow init --project-type="web-development"

# With specific integration type
npx claude-flow init --project-type="geospatial-analysis" --integration="hybrid"

# Force overwrite existing files
npx claude-flow init --project-type="api-development" --force
```

### What Gets Created
```
your-project/
├── .claude/                    # Claude-specific configurations
│   ├── commands/              # Available commands and workflows
│   ├── settings.json          # Main settings
│   └── settings.local.json    # Local overrides
├── .mcp.json                  # Model Context Protocol config
├── claude-flow.config.json    # Claude-flow main configuration
├── CLAUDE.md                  # Instructions for Claude
└── .claude-flow/              # Metrics and cache
    └── metrics/
```

---

## ⚙️ Configuration

### Basic Configuration File
**`claude-flow.config.json`**
```json
{
  "project": {
    "name": "Your Project Name",
    "version": "1.0.0",
    "description": "Project description",
    "type": "web-development"
  },
  "agents": {
    "your-specialist": {
      "description": "Specialized agent for your domain",
      "skills": ["skill1", "skill2", "skill3"],
      "libraries": ["react", "typescript"],
      "context": "path/to/context/files",
      "specialization": "Your specific domain expertise"
    }
  },
  "workflows": {
    "development-acceleration": {
      "description": "Accelerate development workflow",
      "agents": ["your-specialist"],
      "steps": [
        "Step 1: Analysis",
        "Step 2: Code generation",
        "Step 3: Testing",
        "Step 4: Documentation"
      ]
    }
  }
}
```

### Environment-Specific Settings
**`.claude/settings.local.json`**
```json
{
  "mcp": {
    "enabled": true,
    "servers": {
      "claude-flow": {
        "command": "npx",
        "args": ["claude-flow", "mcp"],
        "env": {
          "NODE_ENV": "development"
        }
      }
    }
  },
  "development": {
    "auto_save": true,
    "hot_reload": true,
    "debug_mode": false
  }
}
```

---

## 💻 Usage Examples

### Basic Commands
```bash
# Check system status
npx claude-flow status

# Start the orchestrator
npx claude-flow start

# Spawn a specialized agent
npx claude-flow agent spawn researcher

# Execute a workflow
npx claude-flow workflow run development-acceleration

# Monitor performance
npx claude-flow monitor

# Stop all agents
npx claude-flow stop
```

### Advanced Workflows
```bash
# Initialize hive mind coordination
npx claude-flow hive-mind init

# Create custom agent swarm
npx claude-flow swarm spawn --agents="backend,frontend,testing" --coordination="parallel"

# Execute complex workflow with monitoring
npx claude-flow workflow execute "full-stack-development" --monitor --metrics

# Generate performance report
npx claude-flow analysis performance-report
```

---

## 🔗 Integration with Existing Projects

### Integration Types

#### 1. Hybrid Integration (Recommended)
- Maintains existing architecture
- Adds AI acceleration on top
- No breaking changes
- Gradual adoption possible

```bash
npx claude-flow init --integration="hybrid"
```

#### 2. Native Integration
- Deep integration with project structure
- Maximum performance benefits
- May require code modifications

```bash
npx claude-flow init --integration="native"
```

### Framework-Specific Integration

#### React/Next.js Projects
```json
{
  "project": {
    "type": "react-application",
    "framework": "next.js"
  },
  "agents": {
    "component-generator": {
      "skills": ["react-components", "typescript", "tailwind"],
      "context": "components/"
    }
  }
}
```

#### Node.js API Projects
```json
{
  "project": {
    "type": "api-development",
    "framework": "express"
  },
  "agents": {
    "api-architect": {
      "skills": ["rest-api", "middleware", "database-integration"],
      "context": "src/routes/"
    }
  }
}
```

#### Python Data Science Projects
```json
{
  "project": {
    "type": "data-science",
    "framework": "jupyter"
  },
  "agents": {
    "data-analyst": {
      "skills": ["pandas", "matplotlib", "machine-learning"],
      "context": "notebooks/"
    }
  }
}
```

---

## 📚 Best Practices

### 1. Node Version Management
```bash
# Create .nvmrc file in project root
echo "20.19.4" > .nvmrc

# Always use correct Node version
nvm use

# Set up automatic switching (add to .bashrc/.zshrc)
autoload -U add-zsh-hook
load-nvmrc() {
  if [[ -f .nvmrc && -r .nvmrc ]]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc
```

### 2. Project Organization
```
project/
├── claude-flow-custom/        # Your custom agents and workflows
│   ├── agents/
│   ├── workflows/
│   └── scripts/
├── .claude/                   # Claude-flow system files
├── src/                       # Your application code
└── docs/                      # Documentation
```

### 3. Agent Development
```typescript
// claude-flow-custom/agents/your-specialist.ts
export class YourSpecialistAgent extends BaseAgent {
  name = 'your-specialist';
  description = 'Specialized agent for your domain';
  skills = ['skill1', 'skill2'];
  
  async execute(context: AgentContext): Promise<AgentResult> {
    // Your agent implementation
    return {
      success: true,
      message: 'Task completed',
      artifacts: ['generated-file.ts']
    };
  }
}
```

### 4. Workflow Orchestration
```typescript
// claude-flow-custom/workflows/your-workflow.ts
export class YourWorkflow {
  async execute(): Promise<WorkflowResult> {
    // Phase 1: Analysis
    const analysisResult = await this.agents.analyst.execute();
    
    // Phase 2: Code Generation  
    const codeResult = await this.agents.generator.execute();
    
    // Phase 3: Testing
    const testResult = await this.agents.tester.execute();
    
    return {
      success: true,
      phases: [analysisResult, codeResult, testResult],
      metrics: this.calculateMetrics()
    };
  }
}
```

### 5. Performance Optimization
```bash
# Monitor memory usage
npx claude-flow monitor memory

# Optimize agent performance
npx claude-flow optimization agent-optimize

# Cache management
npx claude-flow cache clear
npx claude-flow cache stats
```

---

## 🎯 Expected Benefits

### Development Speed
- **75% time reduction** on repetitive tasks
- **92-96% faster** code generation
- **Automated testing** and documentation
- **Intelligent error handling** and debugging

### Code Quality
- **Consistent patterns** across codebase
- **Best practices** automatically applied
- **Comprehensive testing** generated automatically
- **Documentation** created in parallel with code

### Team Productivity
- **Reduced context switching** between tasks
- **Automated code reviews** and suggestions
- **Parallel development** with agent coordination
- **Knowledge sharing** through agent memory

---

## 🔍 Verification Checklist

After setup, verify everything works:

```bash
# ✅ Check claude-flow version
npx claude-flow --version

# ✅ Verify system status
npx claude-flow status

# ✅ Test agent spawning
npx claude-flow agent spawn test-agent

# ✅ Check memory system
npx claude-flow memory store "test" "value"
npx claude-flow memory search "test"

# ✅ Verify workflow execution
npx claude-flow workflow list
```

Expected output:
```
✅ Claude-Flow System Status:
🟢 Running (orchestrator active)
🤖 Agents: 1 active
📋 Tasks: 0 in queue
💾 Memory: Ready (1 entries)
🖥️  Terminal Pool: Ready
🌐 MCP Server: Running
```

---

## 🆘 Support and Resources

### Documentation
- **GitHub Repository**: https://github.com/ruvnet/claude-flow
- **Documentation Site**: https://docs.claude-flow.com
- **API Reference**: https://api.claude-flow.com

### Community
- **Discord Server**: https://discord.gg/claude-flow
- **GitHub Issues**: https://github.com/ruvnet/claude-flow/issues
- **Stack Overflow**: Tag `claude-flow`

### Getting Help
```bash
# Built-in help
npx claude-flow --help
npx claude-flow agent --help
npx claude-flow workflow --help

# Debug mode
npx claude-flow --debug status
```

---

**Document Version**: 1.0.0  
**Last Updated**: January 26, 2025  
**Compatible with**: claude-flow v2.0.1+  

---

*This guide provides complete setup instructions for claude-flow across different projects and environments. Follow the troubleshooting section if you encounter any issues during installation.*