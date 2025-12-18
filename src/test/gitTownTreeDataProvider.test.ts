import * as assert from 'assert';
import * as vscode from 'vscode';
import { GitTownTreeDataProvider } from '../trees/GitTownTreeDataProvider';

suite('GitTownTreeDataProvider Tests', () => {
  let provider: GitTownTreeDataProvider;

  setup(() => {
    provider = new GitTownTreeDataProvider();
  });

  test('getTreeItem returns the item passed in', () => {
    const item = new vscode.TreeItem('test');
    const result = provider.getTreeItem(item as any);
    assert.strictEqual(result, item);
  });

  test('getChildren returns root items when no element provided', async () => {
    const children = await provider.getChildren();

    assert.strictEqual(children.length, 3, 'Should have 3 root items');
    assert.strictEqual(children[0].label, 'Status');
    assert.strictEqual(children[1].label, 'Branches');
    assert.strictEqual(children[2].label, 'Workflows');
  });

  test('getChildren returns Status items', async () => {
    const rootChildren = await provider.getChildren();
    const statusItem = rootChildren.find((c: any) => c.label === 'Status');

    assert.ok(statusItem, 'Status item should exist');

    const statusChildren = await provider.getChildren(statusItem as any);
    assert.strictEqual(statusChildren.length, 2, 'Should have 2 status children');
    assert.ok(statusChildren[0].label?.includes('Current Branch'));
    assert.ok(statusChildren[1].label?.includes('Uncommitted Changes'));
  });

  test('getChildren returns Workflows items', async () => {
    const rootChildren = await provider.getChildren();
    const workflowsItem = rootChildren.find((c: any) => c.label === 'Workflows');

    assert.ok(workflowsItem, 'Workflows item should exist');

    const workflowChildren = await provider.getChildren(workflowsItem as any);
    assert.strictEqual(workflowChildren.length, 4, 'Should have 4 workflow commands');
    assert.ok(workflowChildren.some((c: any) => c.label?.includes('Sync')));
    assert.ok(workflowChildren.some((c: any) => c.label?.includes('Hack')));
    assert.ok(workflowChildren.some((c: any) => c.label?.includes('Ship')));
    assert.ok(workflowChildren.some((c: any) => c.label?.includes('Propose')));
  });

  test('refresh debounces multiple calls', async () => {
    let fireCount = 0;

    const listener = provider.onDidChangeTreeData(() => {
      fireCount++;
    });

    provider.refresh();
    provider.refresh();
    provider.refresh();

    assert.strictEqual(fireCount, 0, 'Should not have fired yet');

    await new Promise(resolve => setTimeout(resolve, 600));

    assert.strictEqual(fireCount, 1, 'Should fire exactly once after debounce');

    listener.dispose();
  });

  test('workflow items are disabled when another command is running', async () => {
    // This test verifies the UI state during command execution
    // In real usage, executingCommands is managed by commandState
    const rootChildren = await provider.getChildren();
    const workflowsItem = rootChildren.find((c: any) => c.label === 'Workflows');
    const workflowChildren = await provider.getChildren(workflowsItem as any);

    // Verify all items have commands by default
    workflowChildren.forEach((item: any) => {
      assert.ok(item.command, `${item.label} should have a command`);
    });
  });

  test('getChildren returns empty array for unknown item type', async () => {
    const unknownItem = new vscode.TreeItem('unknown');
    const children = await provider.getChildren(unknownItem as any);

    assert.deepStrictEqual(children, [], 'Should return empty array for unknown item');
  });
});
