import * as vscode from 'vscode';
import { BranchInfo } from '../branches/BranchInfo';
import { BranchType } from '../branches/BranchType';

/**
 * Represents a branch in the tree view.
 * Uses VS Code ThemeIcon for consistent iconography.
 */
export class BranchTreeItem extends vscode.TreeItem {
    constructor(public readonly branchInfo: BranchInfo) {
        super(branchInfo.name, vscode.TreeItemCollapsibleState.None);
        
        // Set icon based on branch type
        this.iconPath = this.getIconForBranchType(branchInfo.type);
        
        // Set context value for conditional commands
        this.contextValue = `branch-${branchInfo.type}`;
        
        // Show parent branch in description if exists
        if (branchInfo.parent) {
            this.description = `← ${branchInfo.parent}`;
        }
        
        // Add tooltip with details
        this.tooltip = this.buildTooltip();
    }

    private getIconForBranchType(type: BranchType): vscode.ThemeIcon {
        switch (type) {
            case BranchType.CURRENT:
                return new vscode.ThemeIcon('check', new vscode.ThemeColor('gitDecoration.modifiedResourceForeground'));
            case BranchType.FEATURE:
                return new vscode.ThemeIcon('git-branch');
            case BranchType.PERENNIAL:
                return new vscode.ThemeIcon('pin');
            case BranchType.PROTOTYPE:
                return new vscode.ThemeIcon('beaker');
            case BranchType.PARKED:
                return new vscode.ThemeIcon('archive');
            default:
                return new vscode.ThemeIcon('git-branch');
        }
    }

    private buildTooltip(): vscode.MarkdownString {
        const tooltip = new vscode.MarkdownString();
        tooltip.appendMarkdown(`**${this.branchInfo.name}**\n\n`);
        tooltip.appendMarkdown(`Type: ${this.branchInfo.type}\n\n`);
        
        if (this.branchInfo.parent) {
            tooltip.appendMarkdown(`Parent: ${this.branchInfo.parent}\n\n`);
        }
        
        return tooltip;
    }
}