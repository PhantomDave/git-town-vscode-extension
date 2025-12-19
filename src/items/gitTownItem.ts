import * as vscode from 'vscode';

export class GitTownItem extends vscode.TreeItem {
    public readonly itemType?: string;
    public readonly isBranch: boolean;
    
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly commandId?: string,
        itemType?: string,
        isBranch: boolean = false
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}`;
        this.itemType = itemType;
        this.isBranch = isBranch;
        
        if (isBranch) {
            this.contextValue = 'branch';
        }
        
        if (commandId) {
            this.command = {
                command: commandId,
                title: this.label,
            };
        }
    }
}