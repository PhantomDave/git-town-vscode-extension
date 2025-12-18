import * as vscode from 'vscode';

export class GitTownItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly commandId?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        
        if (commandId) {
            this.command = {
                command: commandId,
                title: this.label,
            };
        }
    }
}