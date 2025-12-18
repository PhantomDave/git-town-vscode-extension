import * as vscode from 'vscode';

export class SettingsItem extends vscode.TreeItem {
    constructor(public readonly label: string, private readonly action?: string) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${this.label}`;
        
        if (action === 'showOutput') {
            this.command = {
                command: 'workbench.action.output.show',
                title: 'Show Output',
                arguments: ['Git Town']
            };
        } else if (action?.startsWith('https://') || action?.startsWith('http://')) {
            this.command = {
                command: 'vscode.open',
                title: 'Open Link',
                arguments: [vscode.Uri.parse(action)]
            };
        }
    }
}
