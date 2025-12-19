import * as assert from 'assert';
import { debounce, isValidGitBranchName, normalizeBranchName } from '../utils';

suite('Utils Tests', () => {
  test('debounce delays execution and only calls once', async () => {
    let callCount = 0;
    const debounced = debounce(() => {
      callCount++;
    }, 50);

    // Call multiple times in quick succession
    debounced();
    debounced();
    debounced();

    assert.strictEqual(callCount, 0, 'Should not have called yet');

    // Wait for debounce to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    assert.strictEqual(callCount, 1, 'Should have called exactly once');
  });

  test('debounce resets timer on new calls', async () => {
    let callCount = 0;
    const debounced = debounce(() => {
      callCount++;
    }, 50);

    debounced();
    await new Promise(resolve => setTimeout(resolve, 30));
    debounced();
    await new Promise(resolve => setTimeout(resolve, 30));
    debounced();

    await new Promise(resolve => setTimeout(resolve, 100));

    assert.strictEqual(callCount, 1, 'Should have called exactly once after final debounce settles');
  });

  test('isValidGitBranchName accepts valid branch names', () => {
    const validNames = [
      'feature/my-feature',
      'bugfix/issue-123',
      'release/v1.0',
      'main',
      'develop',
      'feature_underscore',
      'feature.dot',
      'feature-dash',
      'feature/nested/branch',
    ];

    validNames.forEach(name => {
      assert.strictEqual(isValidGitBranchName(name), true, `Should accept: ${name}`);
    });
  });

  test('isValidGitBranchName rejects invalid branch names', () => {
    const invalidNames = [
      '',
      '-invalid',
      '_invalid',
      '.invalid',
      'invalid/',
      'invalid.',
      'invalid//double',
      'invalid$injection',
      'invalid;semicolon',
      'invalid|pipe',
      'invalid&ampersand',
    ];

    invalidNames.forEach(name => {
      assert.strictEqual(isValidGitBranchName(name), false, `Should reject: ${name}`);
    });
  });

  test('isValidGitBranchName accepts branches starting with numbers', () => {
    assert.strictEqual(isValidGitBranchName('123-feature'), true);
  });

  test('normalizeBranchName converts spaces to hyphens', () => {
    const result = normalizeBranchName('my feature branch');
    assert.strictEqual(result.normalized, 'my-feature-branch');
    assert.strictEqual(result.wasModified, true);
  });

  test('normalizeBranchName handles multiple consecutive spaces', () => {
    const result = normalizeBranchName('my  feature   branch');
    assert.strictEqual(result.normalized, 'my--feature---branch');
    assert.strictEqual(result.wasModified, true);
  });

  test('normalizeBranchName returns unchanged name when no spaces', () => {
    const result = normalizeBranchName('my-feature-branch');
    assert.strictEqual(result.normalized, 'my-feature-branch');
    assert.strictEqual(result.wasModified, false);
  });

  test('normalizeBranchName handles leading and trailing spaces', () => {
    const result = normalizeBranchName(' my feature ');
    assert.strictEqual(result.normalized, '-my-feature-');
    assert.strictEqual(result.wasModified, true);
  });

  test('normalizeBranchName handles empty string', () => {
    const result = normalizeBranchName('');
    assert.strictEqual(result.normalized, '');
    assert.strictEqual(result.wasModified, false);
  });

  test('normalizeBranchName handles mixed special characters', () => {
    const result = normalizeBranchName('feature/my branch_v1.0');
    assert.strictEqual(result.normalized, 'feature/my-branch_v1.0');
    assert.strictEqual(result.wasModified, true);
  });
});
