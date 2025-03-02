# Basket.js

Basket.js is a script loader that efficiently caches scripts in localStorage for improved page load times.

## Features

- **Script Caching**: Automatically caches loaded scripts in localStorage
- **Version Control**: Built-in support for script versioning
- **Expiration Control**: Set expiration times for cached scripts
- **Promise-based API**: Modern Promise-based interface
- **Custom Handlers**: Support for different content types
- **Modular**: ESM and CommonJS support

## Installation

```bash
npm install basket.js
```

## Usage

### ES Modules

```javascript
import basket from 'basket.js';

// Load a single script
basket.require({ url: 'jquery.min.js' })
  .then(() => {
    console.log('jQuery loaded!');
  });

// Load multiple scripts
basket.require(
  { url: 'jquery.min.js' },
  { url: 'backbone.min.js' }
).then(() => {
  console.log('Libraries loaded!');
});

// Advanced usage with options
basket.require({
  url: 'my-script.js',
  key: 'custom-key',        // Custom key for storage
  expire: 24,               // Expires in 24 hours
  execute: false,           // Don't execute after loading
  unique: '1.0.0',         // Version control
  skipCache: false,        // Use cache when available
  live: false              // Always fetch fresh copy
});
```

### CommonJS

```javascript
const basket = require('basket.js');
```

## API

### basket.require(options)

Loads one or more scripts with specified options.

Options:
- `url` (String): URL of the script to load
- `key` (String): Custom storage key (defaults to URL)
- `expire` (Number): Hours until expiration (default: 5000)
- `execute` (Boolean): Whether to execute the script (default: true)
- `unique` (String/Number): Version identifier
- `skipCache` (Boolean): Skip localStorage caching
- `live` (Boolean): Always fetch from network

Returns a Promise that resolves when all scripts are loaded.

### basket.remove(key)

Removes a script from localStorage.

```javascript
basket.remove('jquery');
```

### basket.clear([expired])

Clears all scripts from localStorage. If `expired` is true, only removes expired scripts.

```javascript
// Clear all scripts
basket.clear();

// Clear only expired scripts
basket.clear(true);
```

### basket.get(key)

Retrieves a script's cached data.

```javascript
const scriptData = basket.get('jquery');
```

### basket.addHandler(type, handler)

Add a custom handler for specific content types.

```javascript
basket.addHandler('text/css', (obj) => {
  const style = document.createElement('style');
  style.textContent = obj.data;
  document.head.appendChild(style);
});
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Browser Support

Basket.js requires browsers with:
- `localStorage` support
- `Promise` support (or use a polyfill)
- Modern JavaScript features (or use appropriate build tools)

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
