# TimorINSS - MInterno

Financial management system for INSS Timor-Leste.

## 🎉 Recently Upgraded to Angular 20!

This project has been upgraded from Angular 11 to Angular 20 with Node v23 support.

**→ If this is your first time after the upgrade, read [`QUICK_START.md`](QUICK_START.md) first!**

## 📋 System Requirements

- **Node.js**: v20.17.0 or higher (v23 recommended)
- **npm**: v10.0.0 or higher
- **Angular CLI**: v20 (installed via npm)

Check your versions:
```bash
node --version  # Should show v20.17+ or v23
npm --version   # Should show v10+
```

## 🚀 Quick Start

### First Time Setup

```bash
# 1. Use correct Node version (if using nvm)
nvm use

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

The application will open at `http://localhost:4200/`

### Subsequent Runs

```bash
npm start
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server at http://localhost:4200 |
| `npm run build` | Build for production (output: `dist/`) |
| `npm run build-qa` | Build for QA environment |
| `npm test` | Run unit tests via Karma |
| `npm run lint` | Run ESLint code quality checks |
| `npm run lint -- --fix` | Auto-fix linting issues |

## 🏗️ Project Structure

```
TimorINSS-MInterno/
├── src/
│   ├── app/
│   │   ├── moduloContribuicoes/   # Contributions module
│   │   ├── moduloGestao/           # Management module
│   │   ├── moduloRelatorios/       # Reports module
│   │   ├── moduloAuditoria/        # Audit module
│   │   ├── componentes/            # Shared components
│   │   ├── services/               # Services
│   │   ├── models/                 # Data models
│   │   └── ...
│   ├── assets/                      # Static assets
│   ├── environments/                # Environment configs
│   └── ...
├── angular.json                     # Angular configuration
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript configuration
```

## 🔧 Development

### Generate Components

```bash
# Generate a new component
ng generate component component-name

# Other generators
ng generate directive|pipe|service|class|guard|interface|enum|module
```

### Building

```bash
# Development build
npm run build

# Production build (optimized)
npm run build

# QA build
npm run build-qa
```

Build artifacts are stored in `dist/TimorINSS-MInterno/`

### Testing

```bash
# Run unit tests
npm test

# Run with code coverage
npm test -- --code-coverage
```

## 🌍 Internationalization

The application supports multiple languages:
- Portuguese (PT) - Default
- English (EN)
- Tetum (TET)

Translation files are located in `src/assets/i18n/`

## 🔐 Environment Configuration

Configure environment variables in:
- `src/environments/environment.ts` - Development
- `src/environments/environment.prod.ts` - Production  
- `src/environments/environment.qa.ts` - QA

## 📚 Upgrade Documentation

After the Angular 20 upgrade, these documents are available:

| Document | Purpose |
|----------|---------|
| [`QUICK_START.md`](QUICK_START.md) | Fast-track guide to get running |
| [`UPGRADE_SUMMARY.md`](UPGRADE_SUMMARY.md) | Overview of all changes made |
| [`UPGRADE_INSTRUCTIONS.md`](UPGRADE_INSTRUCTIONS.md) | Detailed upgrade walkthrough |
| [`BREAKING_CHANGES.md`](BREAKING_CHANGES.md) | Known breaking changes & fixes |
| [`MIGRATION_GUIDE.md`](MIGRATION_GUIDE.md) | Technical migration details |

## 🛠️ Technology Stack

### Core
- **Angular**: 20.x
- **TypeScript**: 5.6.x
- **RxJS**: 7.8.x
- **Zone.js**: 0.15.x

### UI Framework
- **Angular Material**: 20.x
- **Angular CDK**: 20.x
- **FontAwesome**: 6.7.x

### Utilities
- **ngx-translate**: Internationalization
- **ngx-spinner**: Loading indicators
- **Chart.js**: Data visualization
- **jsPDF**: PDF generation
- **xlsx**: Excel operations
- **moment**: Date manipulation
- **qrcode**: QR code generation

## 🚨 Troubleshooting

### Common Issues

**Issue**: Application won't start
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Build errors
```bash
# Check Node version
node --version  # Must be v20.17+ or v23

# Switch to correct version
nvm use 23
```

**Issue**: TypeScript errors
- Check [`BREAKING_CHANGES.md`](BREAKING_CHANGES.md) for known issues
- Most compilation errors are documented with solutions

### Getting Help

1. Check the troubleshooting section in [`UPGRADE_INSTRUCTIONS.md`](UPGRADE_INSTRUCTIONS.md)
2. Review [`BREAKING_CHANGES.md`](BREAKING_CHANGES.md)
3. Consult [Angular Documentation](https://angular.dev)

## 📖 Further Resources

- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.io)
- [Angular CLI Reference](https://angular.io/cli)
- [Angular Update Guide](https://update.angular.io/)

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and fix issues
4. Run `npm test` to ensure tests pass
5. Create a pull request

## 📄 License

[Add your license information here]

## 🔄 Rollback Instructions

If you need to rollback the Angular 20 upgrade:

```bash
cp package.json.backup package.json
rm -rf node_modules package-lock.json
npm install
```

See [`UPGRADE_SUMMARY.md`](UPGRADE_SUMMARY.md) for details.

---

**Version**: Angular 20.0.0  
**Last Updated**: November 2025  
**Node Version**: 23.x (minimum 20.17.0)
