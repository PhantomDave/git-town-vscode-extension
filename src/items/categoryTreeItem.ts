import * as vscode from "vscode";
import { BranchInfo } from "../branches/BranchInfo";

/**
 * Represents a category header in the tree view.
 * VS Code TreeItem is the base class for tree view elements.
 */
export class CategoryTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly branches: BranchInfo[]
    ) {
        super(label, vscode.TreeItemCollapsibleState.Expanded);
        
        // Set context value for conditional menu items
        this.contextValue = 'category';
        
        // Add count badge
        this.description = `${branches.length}`;
    }
}