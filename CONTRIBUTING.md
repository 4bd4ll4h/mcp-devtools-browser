# Contributing to Puppeteer Developer Browser MCP

Thank you for your interest in contributing to Puppeteer Developer Browser MCP! We welcome contributions from the community and are excited to collaborate with you.

## 🎯 How to Contribute

### Reporting Issues

If you find a bug or have a feature request, please [create an issue](https://github.com/4bd4ll4h/mcp-devtools-browser/issues) with the following information:

- **Bug Reports**:
  - Clear description of the issue
  - Steps to reproduce
  - Expected vs actual behavior
  - Browser/Node.js versions
  - Error logs if available

- **Feature Requests**:
  - Clear description of the feature
  - Use cases and benefits
  - Any implementation ideas

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

## 🛠 Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/4bd4ll4h/mcp-devtools-browser.git
   cd mcp-devtools-browser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Test with MCP Inspector**
   ```bash
   npm run inspector
   ```

### Development Workflow

- Use `npm run watch` for development with auto-rebuild
- Use `npm run build` for production builds
- Use `npm run inspector` to test MCP functionality

## 📝 Code Standards

### TypeScript Guidelines

- Use TypeScript strict mode
- Provide proper type annotations
- Use interfaces for complex data structures
- Prefer `const` over `let` where possible
- Use descriptive variable and function names

### Code Style

- 2-space indentation
- Use semicolons
- Single quotes for strings
- Use async/await over callbacks
- Export types and interfaces explicitly

### File Organization

- Keep files focused and single-purpose
- Use descriptive file names
- Group related functionality in directories
- Export from `index.ts` files for clean imports

## 🧪 Testing

### Adding Tests

When adding new features or fixing bugs:

1. Add unit tests for utility functions
2. Add integration tests for MCP tools
3. Test error conditions and edge cases
4. Ensure tests are deterministic

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📚 Documentation

### Documentation Standards

- Update README.md for user-facing changes
- Add API documentation for new tools
- Include usage examples
- Document breaking changes

### Documentation Structure

- **README.md**: Project overview and quick start
- **API.md**: Complete API reference
- **EXAMPLES.md**: Usage examples and tutorials
- **DEVELOPMENT.md**: Architecture and development guide

## 🏗 Project Architecture

### Core Components

- **BrowserManager**: Singleton browser instance management
- **EventLogger**: Thread-safe event logging
- **Tools System**: MCP tool registration and handlers
- **Resource System**: MCP resource providers

### Adding New Tools

1. Define tool schema in `src/schema/toolsSchema.ts`
2. Implement tool handler in appropriate category directory
3. Register tool in `src/tools/toolsRegister.ts`
4. Add comprehensive error handling
5. Update API documentation

### Adding New Resources

1. Define resource schema in `src/schema/resourcesSchema.ts`
2. Implement resource handler in `src/resources/`
3. Register resource in main server file
4. Add documentation

## 🔍 Code Review Process

All pull requests require review before merging. Reviewers will check:

- **Functionality**: Does the code work as intended?
- **Code Quality**: Follows project standards and patterns
- **Tests**: Adequate test coverage
- **Documentation**: Updated documentation
- **Performance**: No significant performance regressions
- **Security**: No security vulnerabilities introduced

## 🐛 Bug Fixes

When fixing bugs:

1. Add a test that reproduces the bug
2. Fix the issue
3. Verify the test passes
4. Add regression tests if applicable

## ✨ Feature Development

For major features:

1. Discuss the feature in an issue first
2. Create a design document if needed
3. Implement in small, reviewable chunks
4. Add comprehensive tests
5. Update all relevant documentation

## 📦 Release Process

Releases are managed by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a release tag
4. Publish to npm

## ❓ Getting Help

- Check existing documentation
- Search existing issues
- Join our community discussions
- Contact maintainers for urgent issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to Puppeteer Developer Browser MCP! 🎉