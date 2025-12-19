import * as vscode from 'vscode';
import { GitTownItem } from '../items/gitTownItem';
import { getGitTownBranches, getCurrentBranch, getUncommittedChangesCount, debounce } from '../utils';
import { executingCommands, isAnyCommandExecuting } from '../commandState';
import { BranchInfo, getAllBranchInfo } from '../branches/BranchInfo';
import { BranchType } from '../branches/BranchType';
import { CategoryTreeItem } from '../items/categoryTreeItem';
import { BranchTreeItem } from '../items/branchTreeItem';

export enum TreeItemType {
    Status = 'Status',
    Branches = 'Branches',
    Workflows = 'Workflows'
}

/**
 * VS Code TreeDataProvider implementation.
 * This interface is required to populate tree views.
 */
export class GitTownTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = 
        new vscode.EventEmitter<vscode.TreeItem | undefined>();
    
    /**
     * Event that fires when tree data changes.
     * VS Code listens to this event to know when to refresh the tree.
     */
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = 
        this._onDidChangeTreeData.event;

    constructor() {}

    /**
     * Triggers tree refresh.
     * Call this after operations that change branch state.
     */
    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    /**
     * Required by TreeDataProvider interface.
     * Returns TreeItem representation for display.
     */
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * Required by TreeDataProvider interface.
     * Returns children for the tree hierarchy.
     * 
     * @param element - Parent element (undefined = root level)
     * @returns Array of child TreeItems
     */
    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        // Root level: return categories
        if (!element) {
            return this.getCategoryItems();
        }

        // Category level: return branches in that category
        if (element instanceof CategoryTreeItem) {
            return element.branches.map(branch => new BranchTreeItem(branch));
        }

        // Branch level: no children
        return [];
    }

    /**
     * Creates category items with branches grouped by type.
     */
    private async getCategoryItems(): Promise<CategoryTreeItem[]> {
        try {
            const branchInfos = await getAllBranchInfo();
            
            console.log('Got branch infos:', branchInfos);
            
            // Group branches by type
            const currentBranches = branchInfos.filter(b => b.isCurrent);
        const featureBranches = branchInfos.filter(b => 
            b.type === BranchType.FEATURE && !b.isCurrent
        );
        const perennialBranches = branchInfos.filter(b => 
            b.type === BranchType.PERENNIAL && !b.isCurrent
        );
        const prototypeBranches = branchInfos.filter(b => 
            b.type === BranchType.PROTOTYPE && !b.isCurrent
        );
        const parkedBranches = branchInfos.filter(b => 
            b.type === BranchType.PARKED && !b.isCurrent
        );

        const categories: CategoryTreeItem[] = [];

        // Always show current branch first
        if (currentBranches.length > 0) {
            categories.push(new CategoryTreeItem('Current Branch', currentBranches));
        }

        // Add feature branches
        if (featureBranches.length > 0) {
            categories.push(new CategoryTreeItem('Feature Branches', featureBranches));
        }

        // Add perennial branches
        if (perennialBranches.length > 0) {
            categories.push(new CategoryTreeItem('Perennial Branches', perennialBranches));
        }

        // Add prototype branches if any
        if (prototypeBranches.length > 0) {
            categories.push(new CategoryTreeItem('Prototype Branches', prototypeBranches));
        }

        // Add parked branches if any
        if (parkedBranches.length > 0) {
            categories.push(new CategoryTreeItem('Parked Branches', parkedBranches));
        }

            console.log('Returning categories:', categories);
            return categories;
        } catch (error) {
            console.error('Error in getCategoryItems:', error);
            vscode.window.showErrorMessage(`Failed to load Git Town data: ${error}`);
            return [];
        }
    }
}