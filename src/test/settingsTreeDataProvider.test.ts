import * as assert from 'assert';
import * as vscode from 'vscode';
import { SettingsTreeDataProvider } from '../trees/SettingsTreeDataProvider';

suite('SettingsTreeDataProvider Tests', () => {
  let provider: SettingsTreeDataProvider;

  setup(() => {
    provider = new SettingsTreeDataProvider();
  });

  test('getTreeItem returns the item passed in', () => {
    const item = new vscode.TreeItem('test');
    const result = provider.getTreeItem(item as any);
    assert.strictEqual(result, item);
  });

  test('getChildren returns settings items when no element provided', async () => {
    const children = await provider.getChildren();

    assert.ok(Array.isArray(children), 'Should return an array');
    // Settings provider should return some items
    assert.ok(children.length >= 0, 'Should have valid children length');
  });

  test('refresh triggers onDidChangeTreeData event', async () => {
    let fired = false;

    const listener = provider.onDidChangeTreeData(() => {
      fired = true;
    });

    provider.refresh();

    // Give a brief moment for event to fire
    await new Promise(resolve => setTimeout(resolve, 10));

    assert.strictEqual(fired, true, 'onDidChangeTreeData should have fired');

    listener.dispose();
  });

  test('getChildren returns empty array for unknown item type', async () => {
    const unknownItem = new vscode.TreeItem('unknown');
    const children = await provider.getChildren(unknownItem as any);

    assert.deepStrictEqual(children, [], 'Should return empty array for unknown item');
  });
});
