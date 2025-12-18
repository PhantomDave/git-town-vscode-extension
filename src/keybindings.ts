import * as vscode from 'vscode';
import { isValidGitBranchName, runGitTownCommand } from './utils';

export function registerKeybindings(context: vscode.ExtensionContext) {
    const keybindingCommands = [
        { command: 'phantomdave-gittown-wrapper.sync', callback: async () => await runGitTownCommand('git town sync') },
        { command: 'phantomdave-gittown-wrapper.hack', callback: async () => {
            const branchName = await vscode.window.showInputBox({
                prompt: 'Enter new branch name',
                placeHolder: 'feature/my-feature'
            });
            if (branchName) {
                if (!isValidGitBranchName(branchName)) {
                    vscode.window.showErrorMessage('Invalid branch name. Must start with alphanumeric and use only letters, numbers, ".", "_", "-", and "/".');
                    return;
                }
                await runGitTownCommand(`git town hack "${branchName}"`);
            }
        }},
        { command: 'phantomdave-gittown-wrapper.ship', callback: async () => {
            const confirm = await vscode.window.showWarningMessage(
                'Ship current branch? This will merge and delete it.',
                { modal: true },
                'Ship'
            );
            if (confirm === 'Ship') {
                await runGitTownCommand('git town ship');
            }
        }},
        { command: 'phantomdave-gittown-wrapper.propose', callback: async () => await runGitTownCommand('git town propose') },
        { command: 'phantomdave-gittown-wrapper.initializeGitTown', callback: async () => await runGitTownCommand('git town init') }
    ];

    keybindingCommands.forEach(({ command, callback }) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(command, callback)
        );
    });
}