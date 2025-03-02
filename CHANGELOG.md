# Changelog

## [1.0.0] - 2025-03-01

Major modernization of the basket.js library, focusing on modern JavaScript practices while maintaining API compatibility.

### Added
- ES Module support (import/export)
- CommonJS compatibility layer
- Interactive demo with real-world examples
- Jest-based test suite with modern mocks
- Proper TypeScript type definitions
- Vite-based build system
- Import maps support for modern browsers

### Changed
- Modernized to ES6+ syntax
- Improved Promise handling
- Enhanced error reporting
- Optimized localStorage management
- Reduced bundle size (3.24 kB ESM, 2.47 kB gzipped)
- Updated documentation with modern examples
- Migrated from Bower to npm
- Replaced manual script injection with modern module loading

### Removed
- Bower dependency
- Grunt build system
- Legacy IE8 support
- Manual AMD/CommonJS wrappers
- Legacy build artifacts
- Travis CI configuration (preparing for modern CI)

### Migration from 0.x
The API surface remains the same, so existing code should continue to work. However, importing the library has changed:

```javascript
// Old (0.x)
<script src="basket.js"></script>

// New (1.0.0) - ESM
import basket from 'basket.js';

// New (1.0.0) - CommonJS
const basket = require('basket.js');
```

Key differences:
1. Installation now uses npm instead of Bower
2. Module loading is preferred over script tags
3. Promises follow modern conventions
4. IE8 compatibility removed
5. Built with modern tooling (Vite)

## [0.5.2] - Previous Version

Last version before modernization. Focused on legacy browser support and traditional loading mechanisms.

Notable features:
- Script loading and caching
- localStorage support
- Promise-based API
- AMD/CommonJS support
- Bower package manager
- Grunt build system
