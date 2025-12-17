// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "phantomdave-gittown-wrapper" is now active!');

	// Register the hello world command
	const disposable = vscode.commands.registerCommand('phantomdave-gittown-wrapper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from git town wrapper!');
	});

	// Register the refresh command
	const refreshDisposable = vscode.commands.registerCommand('phantomdave-gittown-wrapper.refresh', () => {
		vscode.window.showInformationMessage('Git Town view refreshed!');
	});

	context.subscriptions.push(disposable, refreshDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
