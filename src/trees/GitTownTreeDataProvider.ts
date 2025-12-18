import * as vscode from 'vscode';
import { GitTownItem } from '../items/gitTownItem';
import { getGitTownBranches, getCurrentBranch, getUncommittedChangesCount, debounce } from '../utils';
import { executingCommands, isAnyCommandExecuting } from '../commandState';

export enum TreeItemType {
    Status = 'Status',
    Branches = 'Branches',
    Workflows = 'Workflows'
}

export class GitTownTreeDataProvider implements vscode.TreeDataProvider<GitTownItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<GitTownItem | undefined | null | void> = new vscode.EventEmitter<GitTownItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<GitTownItem | undefined | null | void> = this._onDidChangeTreeData.event;
    private readonly debouncedRefresh = debounce(() => this._onDidChangeTreeData.fire(), 500);

    refresh(): void {
        this.debouncedRefresh();
    }

    getTreeItem(element: GitTownItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: GitTownItem): Promise<GitTownItem[]> {
        if (!element) {
            // Root level items
            return [
                new GitTownItem('Status', vscode.TreeItemCollapsibleState.Collapsed, undefined, TreeItemType.Status),
                new GitTownItem('Branches', vscode.TreeItemCollapsibleState.Collapsed, undefined, TreeItemType.Branches),
                new GitTownItem('Workflows', vscode.TreeItemCollapsibleState.Expanded, undefined, TreeItemType.Workflows),
            ];
        }

        // Handle children based on parent type
        if (element.itemType === TreeItemType.Status) {
            const [currentBranch, changesCount] = await Promise.all([
                getCurrentBranch(),
                getUncommittedChangesCount()
            ]);
            
            return [
                new GitTownItem(`Current Branch: ${currentBranch}`, vscode.TreeItemCollapsibleState.None),
                new GitTownItem(`Uncommitted Changes: ${changesCount}`, vscode.TreeItemCollapsibleState.None),
            ];
        }

        if (element.itemType === TreeItemType.Branches) {
            const [branches, currentBranch] = await Promise.all([
                getGitTownBranches(),
                getCurrentBranch()
            ]);
            
            return branches.map(branch => {
                const item = new GitTownItem(branch, vscode.TreeItemCollapsibleState.None);
                if (branch === currentBranch) {
                    item.description = '(current)';
                    item.iconPath = new vscode.ThemeIcon('check');
                }
                return item;
            });
        }

        if (element.itemType === TreeItemType.Workflows) {
            return [
                this.createWorkflowItem('Sync', 'phantomdave-gittown-wrapper.sync'),
                this.createWorkflowItem('Hack (New Branch)', 'phantomdave-gittown-wrapper.hack'),
                this.createWorkflowItem('Ship (Merge & Delete)', 'phantomdave-gittown-wrapper.ship'),
                this.createWorkflowItem('Propose (Create PR)', 'phantomdave-gittown-wrapper.propose'),
            ];
        }

        return [];
    }

    private createWorkflowItem(label: string, commandId: string): GitTownItem {
        const item = new GitTownItem(label, vscode.TreeItemCollapsibleState.None, commandId);
        const busy = isAnyCommandExecuting();
        const isRunning = executingCommands.has(commandId);

        if (isRunning) {
            item.iconPath = new vscode.ThemeIcon('sync~spin');
            item.description = 'Running…';
            item.tooltip = `${label} (running)`;
            item.command = undefined;
        } else if (busy) {
            item.command = undefined;
            item.tooltip = `${label} (waiting for current command to finish)`;
        }

        return item;
    }
}