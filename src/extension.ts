import * as vscode from 'vscode';
import { isGitRepository, isGitTownInitialized, isGitTownInstalled, runGitTownCommand, getOutputChannel, sleep, isValidGitBranchName } from './utils';
import { enqueueCommandExecution, onCommandStateChanged } from './commandState';
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

	// Refresh the tree whenever command execution state changes so busy states stay visible
	context.subscriptions.push(
		onCommandStateChanged(() => {
			gitTownProvider?.refresh();
		})
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
	const runWorkflowCommand = async (
		commandId: string,
		friendlyName: string,
		action: () => Promise<void>
	) => {
		try {
			await enqueueCommandExecution(commandId, action);
			gitTownProvider.refresh();
			settingsProvider.refresh();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			vscode.window.showErrorMessage(`${friendlyName} failed: ${message}`);
		}
	};

	context.subscriptions.push(
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.sync', async () => {
			await runWorkflowCommand('phantomdave-gittown-wrapper.sync', 'Git Town sync', async () => {
				await runGitTownCommand('git town sync');
			});
		}),
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.hack', async () => {
			const branchName = await vscode.window.showInputBox({
				prompt: 'Enter new branch name',
				placeHolder: 'feature/my-feature'
			});
			if (branchName) {
				// Validate branch name to prevent command injection
				if (!isValidGitBranchName(branchName)) {
					vscode.window.showErrorMessage(
						'Invalid branch name. Must start with alphanumeric and use only letters, numbers, ".", "_", "-", and "/".'
					);
					return;
				}
				await runWorkflowCommand('phantomdave-gittown-wrapper.hack', 'Git Town hack', async () => {
					await runGitTownCommand(`git town hack "${branchName}"`);
				});
			}
		}),
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.ship', async () => {
			const confirm = await vscode.window.showWarningMessage(
				'Ship current branch? This will merge and delete it.',
				{ modal: true },
				'Ship'
			);
			if (confirm === 'Ship') {
				await runWorkflowCommand('phantomdave-gittown-wrapper.ship', 'Git Town ship', async () => {
					await runGitTownCommand('git town ship');
				});
			}
		}),
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.propose', async () => {
			await runWorkflowCommand('phantomdave-gittown-wrapper.propose', 'Git Town propose', async () => {
				await runGitTownCommand('git town propose');
			});
		}),
		vscode.commands.registerCommand('phantomdave-gittown-wrapper.initializeGitTown', async () => {
			await runWorkflowCommand('phantomdave-gittown-wrapper.initializeGitTown', 'Git Town initialize', async () => {
				await runGitTownCommand('git town init');
				
				// Poll for initialization completion instead of using arbitrary timeout
				const maxWaitMs = 10000;
				const pollIntervalMs = 500;
				const startTime = Date.now();

				while (!(await isGitTownInitialized()) && Date.now() - startTime < maxWaitMs) {
					await sleep(pollIntervalMs);
				}
			});
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

