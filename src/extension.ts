// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { isGitRepository, isGitTownInitialized, isGitTownInstalled } from './utils';
import { SettingsTreeDataProvider } from './trees/SettingsTreeDataProvider';
import { GitTownTreeDataProvider } from './trees/GitTownTreeDataProvider';

// Tree data provider for Git Town view


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const isGitRepo = isGitRepository();
	if (!isGitRepo) {
		vscode.window.showErrorMessage('This workspace is not a Git repository. Git Town extension will not function properly.');
		return;
	}

	const gtVersion = isGitTownInstalled();
	console.log('Congratulations, your extension "phantomdave-gittown-wrapper" is now active!');
	vscode.window.showInformationMessage('Git town found, version: ' + gtVersion);

	const isGtInitialized = isGitTownInitialized();
	if (!isGtInitialized) {
		vscode.window.showWarningMessage('Git Town is NOT initialized in this repository.', {}, 'Initialize Now').then(selection => {
			if (selection === 'Initialize Now') {
				vscode.commands.executeCommand('phantomdave-gittown-wrapper.initializeGitTown');
			}
		});
	} else {
		vscode.window.showInformationMessage('Git Town is initialized in this repository.');
	}

	const registerGtDisposable = vscode.commands.registerCommand('phantomdave-gittown-wrapper.initializeGitTown', async () => {
		const terminal = vscode.window.createTerminal('Git Town Initialization');
		terminal.show();
		terminal.sendText('echo "Initializing Git Town..."');
		terminal.sendText('git town init');
		vscode.window.showInformationMessage('Git Town initialization command sent to terminal.');
	});

	context.subscriptions.push(registerGtDisposable);

	// Register tree data providers
	const gitTownProvider = new GitTownTreeDataProvider();
	const settingsProvider = new SettingsTreeDataProvider();

	vscode.window.registerTreeDataProvider('gittown-view', gitTownProvider);
	vscode.window.registerTreeDataProvider('gittown-settings', settingsProvider);

	// Register the refresh command
	const refreshDisposable = vscode.commands.registerCommand('phantomdave-gittown-wrapper.refresh', () => {
		vscode.window.showInformationMessage('Git Town view refreshed!');
	});

	context.subscriptions.push(refreshDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

