# Contributing to Flutter Dev Assistant

Thank you for your interest in contributing to Flutter Dev Assistant! This document provides comprehensive guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Contribution Guidelines](#contribution-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender identity, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Flutter SDK 3.0.0 or higher
- Dart SDK 3.0.0 or higher
- Node.js 18.0.0 or higher (for MCP server development)
- Git 2.25.0 or higher
- A GitHub account
- Familiarity with Flutter development best practices

### Finding Ways to Contribute

1. **Browse Open Issues**: Check [GitHub Issues](https://github.com/andreimbro/flutter-dev-assistant/issues) for tasks labeled `good first issue` or `help wanted`
2. **Review Documentation**: Look for areas that need clarification or expansion
3. **Test Features**: Use the tool and report bugs or suggest improvements
4. **Share Ideas**: Participate in [GitHub Discussions](https://github.com/andreimbro/flutter-dev-assistant/discussions)

---

## How to Contribute

### Reporting Bugs

When reporting bugs, please include:

1. **Clear Title**: Descriptive summary of the issue
2. **Environment Details**:
   - Flutter version (`flutter --version`)
   - Dart version (`dart --version`)
   - Operating system and version
   - IDE (Claude Code or Kiro) and version
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Expected Behavior**: What you expected to happen
5. **Actual Behavior**: What actually happened
6. **Code Examples**: Minimal reproducible code sample
7. **Screenshots**: If applicable
8. **Error Messages**: Complete error messages and stack traces

**Template**:
```markdown
**Environment**
- Flutter: 3.x.x
- Dart: 3.x.x
- OS: macOS 14.x / Linux / Windows
- IDE: Claude Code / Kiro x.x.x

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
Description of expected behavior

**Actual Behavior**
Description of actual behavior

**Code Sample**
\`\`\`dart
// Minimal reproducible code
\`\`\`

**Error Messages**
\`\`\`
Error message and stack trace
\`\`\`
```

### Suggesting Enhancements

When suggesting enhancements, please include:

1. **Clear Title**: Descriptive summary of the enhancement
2. **Use Case**: Explain the problem this enhancement solves
3. **Proposed Solution**: Describe your proposed solution
4. **Alternatives Considered**: Other solutions you've considered
5. **Additional Context**: Any other relevant information

**Template**:
```markdown
**Use Case**
Description of the problem or need

**Proposed Solution**
Detailed description of the proposed enhancement

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Screenshots, mockups, or examples
```

### Contributing Code

1. **Fork the Repository**
   ```bash
   # Fork via GitHub UI, then clone
   git clone https://github.com/YOUR-USERNAME/flutter-dev-assistant.git
   cd flutter-dev-assistant
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make Your Changes**
   - Follow the [Contribution Guidelines](#contribution-guidelines)
   - Write clear, concise commit messages
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   # For MCP server changes
   cd mcp-server
   npm test
   
   # Test manually in a Flutter project
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve bug in component"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template
   - Submit for review

---

## Development Setup

### Initial Setup

```bash
# Clone repository
git clone https://github.com/andreimbro/flutter-dev-assistant.git
cd flutter-dev-assistant

# Install MCP server dependencies
cd mcp-server
npm install

# Run tests
npm test

# Return to root
cd ..
```

### Project Structure

```
flutter-dev-assistant/
├── mcp-server/              # Core MCP server (Node.js)
│   ├── index.js             # Entry point
│   ├── commands/            # Tool implementations
│   ├── assistants/          # Assistant JSON definitions
│   ├── lib/                 # Shared modules
│   └── __tests__/           # Test suite
├── plugins/
│   ├── claude-code/         # Claude Code plugin
│   │   ├── .claude-plugin/  # Plugin manifest
│   │   ├── commands/        # 8 slash command markdown files
│   │   ├── assistants/      # 11 AI assistant markdown files
│   │   └── skills/          # 23 skill markdown files
│   └── kiro/                # Kiro IDE plugin
│       ├── install.sh       # Installation script
│       ├── hooks/           # 8 automation hooks
│       ├── skills/          # 23 skill markdown files
│       └── steering/        # 7 workflow guides
└── docs/                    # Documentation
```

### Testing

```bash
# Run MCP server tests
cd mcp-server
npm test

# Run specific test file
npm test test-checkpoint.js

# Test in a real Flutter project
cd /path/to/flutter/project
# Test commands manually
```

---

## Contribution Guidelines

### Code Style

#### Markdown Files
- Use clear, descriptive headings
- Include code examples with proper syntax highlighting
- Keep line length reasonable (80-120 characters)
- Use consistent formatting throughout

#### JavaScript (MCP Server)
- Follow ESM module syntax
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Handle errors gracefully
- Use async/await for asynchronous operations

#### Documentation
- Write in clear, professional English
- Use active voice
- Provide concrete examples
- Include both "what" and "why"
- Keep technical jargon to a minimum

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(verify): add accessibility checks to verification loop
fix(checkpoint): resolve JSON serialization issue
docs(readme): update installation instructions
refactor(mcp-server): improve error handling
test(security): add security audit test cases
chore(deps): update dependencies
```

### Adding New Components

#### New AI Assistant

1. Create markdown file in `plugins/claude-code/assistants/`
2. Follow existing assistant structure:
   ```markdown
   # Assistant Name
   
   ## Purpose
   Clear description of what this assistant does
   
   ## Analysis Approach
   How the assistant analyzes code
   
   ## Output Format
   What the assistant provides
   
   ## Example Usage
   Concrete examples
   ```
3. Update `plugins/claude-code/.claude-plugin/plugin.json` agents array
4. Add documentation in README.md
5. Create tests if applicable

#### New Skill

1. Create markdown file in `plugins/claude-code/skills/` (and copy to `plugins/kiro/skills/`)
2. Add frontmatter:
   ```yaml
   ---
   name: skill-name
   description: Brief description
   origin: Flutter Dev Assistant
   ---
   ```
3. Include practical, actionable content
4. Add code examples
5. Update `plugins/claude-code/.claude-plugin/plugin.json` skills array
6. Reference in relevant documentation

#### New Workflow Command

1. Create markdown file in `plugins/claude-code/commands/`
2. Follow command structure:
   ```markdown
   ---
   name: command-name
   description: Brief description
   ---
   
   # Command Name
   
   ## Purpose
   ## Usage
   ## Parameters
   ## Examples
   ## Output
   ```
3. Implement in `mcp-server/commands/` if needed
4. Add tests in `mcp-server/__tests__/`
5. Update documentation

#### New Hook

1. Create hook file in `plugins/kiro/hooks/`
2. Follow hook schema:
   ```json
   {
     "name": "Hook Name",
     "version": "1.0.0",
     "when": {
       "type": "event-type",
       "patterns": ["*.dart"]
     },
     "then": {
       "type": "action-type",
       "command": "command"
     }
   }
   ```
3. Document in `docs/guides/HOOKS_GUIDE.md`
4. Test thoroughly

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main
- [ ] No merge conflicts

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (specify)

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass

## Related Issues
Closes #issue-number
```

### Review Process

1. **Automated Checks**: CI/CD runs automated tests
2. **Code Review**: Maintainers review code quality and design
3. **Feedback**: Address review comments
4. **Approval**: At least one maintainer approval required
5. **Merge**: Maintainer merges the PR

### After Merge

- PR is merged into main branch
- Changes included in next release
- Contributor credited in release notes

---

## Release Process

### For Maintainers Only

#### Pre-Release Checklist

- [ ] Update version in `plugins/claude-code/.claude-plugin/plugin.json`
- [ ] Update version in `mcp-server/package.json`
- [ ] Update `CHANGELOG.md` with release notes
- [ ] Test locally in Flutter project
- [ ] Validate all JSON files
- [ ] Verify all documentation links
- [ ] Run through all workflows manually
- [ ] Test on both Claude Code and Kiro

#### Release Steps

1. **Update Version Numbers**
   ```bash
   # Update .claude-plugin/plugin.json
   # Update mcp-server/package.json
   # Update CHANGELOG.md
   ```

2. **Commit and Tag**
   ```bash
   git add .
   git commit -m "chore: release v1.x.x"
   git tag -a v1.x.x -m "Release v1.x.x"
   git push origin main --tags
   ```

3. **Create GitHub Release**
   ```bash
   gh release create v1.x.x \
     --title "Flutter Dev Assistant v1.x.x" \
     --notes-file RELEASE_NOTES.md
   ```

4. **Publish to Marketplaces**
   - Claude Code plugin marketplace
   - Kiro power registry (if applicable)

#### Post-Release

- [ ] Announce on social media
- [ ] Update documentation site
- [ ] Monitor for issues
- [ ] Respond to user feedback

---

## Questions?

- **General Questions**: [GitHub Discussions](https://github.com/andreimbro/flutter-dev-assistant/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/andreimbro/flutter-dev-assistant/issues)
- **Security Issues**: Contact maintainers privately

---

## License

By contributing to Flutter Dev Assistant, you agree that your contributions will be licensed under the Apache License 2.0.

---

**Thank you for contributing to Flutter Dev Assistant!** 🚀
