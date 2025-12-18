import * as vscode from 'vscode';

export class GitTownItem extends vscode.TreeItem {
    public readonly itemType?: string;
    
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly commandId?: string,
        itemType?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        this.itemType = itemType;
        
        if (commandId) {
            this.command = {
                command: commandId,
                title: this.label,
            };
        }
    }
}