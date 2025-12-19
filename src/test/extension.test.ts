import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	suiteSetup(async () => {
		// Ensure the extension is activated before running tests
		const ext = vscode.extensions.getExtension('PhantomDave.phantomdave-gittown-wrapper');
		if (ext && !ext.isActive) {
			await ext.activate();
		}
	});

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('showOutput command is registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('phantomdave-gittown-wrapper.showOutput'), 'showOutput command should be registered');
	});

	test('showOutput command executes without error', async () => {
		try {
			await vscode.commands.executeCommand('phantomdave-gittown-wrapper.showOutput');
			assert.ok(true, 'showOutput command executed successfully');
		} catch (error) {
			assert.fail(`showOutput command failed: ${error}`);
		}
	});

	test('checkoutBranch command is registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('phantomdave-gittown-wrapper.checkoutBranch'), 'checkoutBranch command should be registered');
	});

	test('checkoutBranch command handles missing branch item', async () => {
		try {
			// Execute command without item parameter (should show error)
			await vscode.commands.executeCommand('phantomdave-gittown-wrapper.checkoutBranch');
			// Command should not throw, but show error message to user
			assert.ok(true, 'checkoutBranch command handled missing item gracefully');
		} catch (error) {
			assert.fail(`checkoutBranch command should not throw: ${error}`);
		}
	});

	test('checkoutBranch command handles item without label', async () => {
		try {
			// Execute command with item that has no label
			await vscode.commands.executeCommand('phantomdave-gittown-wrapper.checkoutBranch', {});
			// Command should not throw, but show error message to user
			assert.ok(true, 'checkoutBranch command handled missing label gracefully');
		} catch (error) {
			assert.fail(`checkoutBranch command should not throw: ${error}`);
		}
	});
});
