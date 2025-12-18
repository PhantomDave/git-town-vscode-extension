import * as vscode from 'vscode';
import { isGitRepository, isGitTownInitialized, isGitTownInstalled, runGitTownCommand, getOutputChannel } from './utils';
import { SettingsTreeDataProvider } from './trees/SettingsTreeDataProvider';
import { GitTownTreeDataProvider } from './trees/GitTownTreeDataProvider';

let gitTownProvider: GitTownTreeDataProvider;
let settingsProvider: SettingsTreeDataProvider;

// This method is called when your extension is activated
export async function activate(context: vscode.ExtensionContext) {
	const outputChannel = getOutputChannel();
	outputChannel.appendLine('Git Town wrapper extension activating...');

	// Initialize tree data providers
	gitTownProvider = new GitTownTreeDataProvider();
	settingsProvider = new SettingsTreeDataProvider();

	// Register tree data providers
	context.subscriptions.push(
		vscode.window.registerTreeDataProvider('gittown-view', gitTownProvider),
		vscode.window.registerTreeDataProvider('gittown-settings', settingsProvider)
	);

	// Register refresh command
	context.subscriptions.push(
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.refresh', async () => {
			outputChannel.appendLine('Refreshing Git Town views...');
			gitTownProvider.refresh();
			settingsProvider.refresh();
			vscode.window.showInformationMessage('Git Town view refreshed!');
		})
	);

	// Register Git Town workflow commands
	context.subscriptions.push(
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.sync', async () => {
			await runGitTownCommand('git town sync');
		}),
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.hack', async () => {
			const branchName = await vscode.window.showInputBox({
				prompt: 'Enter new branch name',
				placeHolder: 'feature/my-feature'
			});
			if (branchName) {
				await runGitTownCommand(`git town hack "${branchName}"`);
				gitTownProvider.refresh();
			}
		}),
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.ship', async () => {
			const confirm = await vscode.window.showWarningMessage(
				'Ship current branch? This will merge and delete it.',
				{ modal: true },
				'Ship'
			);
			if (confirm === 'Ship') {
				await runGitTownCommand('git town ship');
				gitTownProvider.refresh();
			}
		}),
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.propose', async () => {
			await runGitTownCommand('git town propose');
		}),
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.initializeGitTown', async () => {
			await runGitTownCommand('git town init');
			setTimeout(() => gitTownProvider.refresh(), 2000);
		})
	);

	// Check prerequisites
	const isGitRepo = await isGitRepository();
	if (!isGitRepo) {
		vscode.window.showErrorMessage('This workspace is not a Git repository. Git Town extension will not function properly.');
		return;
	}

	const gtVersion = await isGitTownInstalled();
	if (!gtVersion) {
		vscode.window.showErrorMessage('Git Town is not installed or not found in PATH.', 'Install Instructions').then(selection => {
			if (selection === 'Install Instructions') {
				vscode.env.openExternal(vscode.Uri.parse('https://www.git-town.com/install'));
			}
		});
		return;
	}

	outputChannel.appendLine(`Git Town found, version: ${gtVersion}`);

	const isGtInitialized = await isGitTownInitialized();
	if (!isGtInitialized) {
		vscode.window.showWarningMessage('Git Town is NOT initialized in this repository.', 'Initialize Now').then(selection => {
			if (selection === 'Initialize Now') {
				vscode.commands.executeCommand('phantomdave-gittown-wrapper.initializeGitTown');
			}
		});
	}

	outputChannel.appendLine('Git Town wrapper extension activated successfully');
}

// This method is called when your extension is deactivated
export function deactivate() {
	getOutputChannel().dispose();
}

