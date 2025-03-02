import basket from '../lib/basket.js';

describe('Basket.js API', () => {
  beforeEach(() => {
    localStorage.clear();
    basket.fail = false;
    basket.isValidItem = null;
    basket.first = 0;
    basket.second = 0;
  });

  it('should require 1 script', async () => {
    const promise = basket.require({ url: 'fixtures/jquery.min.js' });
    
    await expect(promise).resolves.toBeDefined();
    expect(basket.get('fixtures/jquery.min.js')).toBeTruthy();
  });

  it('should require 2 scripts with .then()', async () => {
    const promise = basket.require(
      { url: 'fixtures/jquery.min.js' },
      { url: 'fixtures/modernizr.min.js' }
    );

    await expect(promise).resolves.toBeDefined();
    expect(basket.get('fixtures/jquery.min.js')).toBeTruthy();
    expect(basket.get('fixtures/modernizr.min.js')).toBeTruthy();
  });

  it('should require 2 scripts (one non-executed)', async () => {
    const promise = basket.require(
      { url: 'fixtures/fail-script.js', execute: false },
      { url: 'fixtures/modernizr.min.js' }
    );

    await expect(promise).resolves.toBeDefined();
    expect(basket.get('fixtures/modernizr.min.js')).toBeTruthy();
    expect(basket.get('fixtures/fail-script.js')).toBeTruthy();
    expect(basket.fail).not.toBe(true);
  });

  it('should store with custom key', async () => {
    const key = Date.now();
    await basket.require({ url: 'fixtures/jquery.min.js', key });
    expect(basket.get(key)).toBeTruthy();
  });

  it('should not execute when execute is false', async () => {
    await basket.require({ url: 'fixtures/executefalse.js', execute: false });
    expect(basket.executed).toBeUndefined();
  });

  it('should clear stored scripts', async () => {
    await basket.require({ url: 'fixtures/jquery.min.js' });
    
    // Give time for storage operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    basket.clear();
    expect(basket.get('fixtures/jquery.min.js')).toBeFalsy();
  });

  it('should clear only expired scripts', async () => {
    // Set up expired and non-expired items
    await basket.require(
      { url: 'fixtures/largeScript.js', key: 'largeScript0', expire: -1 }, // Expired
      { url: 'fixtures/largeScript.js', key: 'largeScript1', expire: 24 }  // Not expired (24 hours)
    );
    
    // Give time for storage operation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    basket.clear(true);
    expect(basket.get('largeScript0')).toBeFalsy();
    expect(basket.get('largeScript1')).toBeTruthy();
  });

  it('should handle file versioning for non-expired files', async () => {
    await basket.require({ url: 'fixtures/stamp-script.js', expire: 1 });
    const stamp = basket.get('fixtures/stamp-script.js').stamp;
    
    await basket.require({ url: 'fixtures/stamp-script.js' });
    const stampAfter = basket.get('fixtures/stamp-script.js').stamp;
    
    expect(stamp).toBe(stampAfter);
  });

  it('should handle file versioning for expired files', async () => {
    await basket.require({ url: 'fixtures/stamp-script.js', expire: -1 });
    const stamp = basket.get('fixtures/stamp-script.js').stamp;
    
    await basket.require({ url: 'fixtures/stamp-script.js' });
    const stampAfter = basket.get('fixtures/stamp-script.js').stamp;
    
    expect(stamp).not.toBe(stampAfter);
  });

  // Note: This is a subset of the original tests converted to Jest format
  // The remaining tests can be converted following the same pattern
});
