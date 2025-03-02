// Mock localStorage for tests
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] ?? null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }

  key(n) {
    return Object.keys(this.store)[n] || null;
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

global.localStorage = new LocalStorageMock();

// Import RSVP globally as it's used by basket.js
import RSVP from 'rsvp';
global.RSVP = RSVP;

// Import XHR mock
import './mocks/xhr.js';

// Mock document.head for script injection
const mockHead = {
  appendChild: () => {}
};
Object.defineProperty(document, 'head', { value: mockHead });
