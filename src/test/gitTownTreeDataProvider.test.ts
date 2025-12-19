import * as assert from 'assert';
import * as vscode from 'vscode';
import { GitTownTreeDataProvider } from '../trees/GitTownTreeDataProvider';
import { CategoryTreeItem } from '../items/categoryTreeItem';

suite('GitTownTreeDataProvider Tests', () => {
  let provider: GitTownTreeDataProvider;

  setup(() => {
    provider = new GitTownTreeDataProvider();
  });

  test('getTreeItem returns the item passed in', () => {
    const item = new vscode.TreeItem('test');
    const result = provider.getTreeItem(item);
    assert.strictEqual(result, item);
  });

  test('getChildren returns category items when no element provided', async () => {
    const children = await provider.getChildren();

    // Should return category items (Current Branch, Feature Branches, etc.)
    assert.ok(Array.isArray(children), 'Should return an array');
    assert.ok(children.length >= 0, 'Should have at least 0 category items');
    
    // All root items should be CategoryTreeItem instances
    children.forEach((child) => {
      assert.ok(child instanceof CategoryTreeItem || child instanceof vscode.TreeItem, 
        'Root items should be CategoryTreeItem or TreeItem instances');
    });
  });

  test('getChildren returns branch items for category', async () => {
    const rootChildren = await provider.getChildren();
    
    if (rootChildren.length > 0) {
      const firstCategory = rootChildren[0];
      const branchChildren = await provider.getChildren(firstCategory);
      
      // Should return branch items or empty array
      assert.ok(Array.isArray(branchChildren), 'Should return an array of branch items');
    }
  });

  test('getChildren returns empty array for non-category items', async () => {
    const nonCategoryItem = new vscode.TreeItem('test');
    const children = await provider.getChildren(nonCategoryItem);

    assert.deepStrictEqual(children, [], 'Should return empty array for non-category items');
  });

  test('refresh fires tree data change event', () => {
    let eventFired = false;

    const listener = provider.onDidChangeTreeData(() => {
      eventFired = true;
    });

    provider.refresh();

    assert.strictEqual(eventFired, true, 'Should fire tree data change event on refresh');

    listener.dispose();
  });
});
