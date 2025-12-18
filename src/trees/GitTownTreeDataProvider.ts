import * as vscode from 'vscode';
import { GitTownItem } from '../items/gitTownItem';
import { getGitTownBranches, getCurrentBranch, getUncommittedChangesCount } from '../utils';

export class GitTownTreeDataProvider implements vscode.TreeDataProvider<GitTownItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<GitTownItem | undefined | null | void> = new vscode.EventEmitter<GitTownItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<GitTownItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: GitTownItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: GitTownItem): Promise<GitTownItem[]> {
        if (!element) {
            // Root level items
            return [
                new GitTownItem('Status', vscode.TreeItemCollapsibleState.Collapsed),
                new GitTownItem('Branches', vscode.TreeItemCollapsibleState.Collapsed),
                new GitTownItem('Workflows', vscode.TreeItemCollapsibleState.Expanded),
            ];
        }

        // Handle children based on parent label
        if (element.label === 'Status') {
            const currentBranch = await getCurrentBranch();
            const changesCount = await getUncommittedChangesCount();
            
            return [
                new GitTownItem(`Current Branch: ${currentBranch}`, vscode.TreeItemCollapsibleState.None),
                new GitTownItem(`Uncommitted Changes: ${changesCount}`, vscode.TreeItemCollapsibleState.None),
            ];
        }

        if (element.label === 'Branches') {
            const branches = await getGitTownBranches();
            const currentBranch = await getCurrentBranch();
            
            return branches.map(branch => {
                const item = new GitTownItem(branch, vscode.TreeItemCollapsibleState.None);
                if (branch === currentBranch) {
                    item.description = '(current)';
                    item.iconPath = new vscode.ThemeIcon('check');
                }
                return item;
            });
        }

        if (element.label === 'Workflows') {
            return [
                new GitTownItem('Sync', vscode.TreeItemCollapsibleState.None, 'phantomdave-gittown-wrapper.sync'),
                new GitTownItem('Hack (New Branch)', vscode.TreeItemCollapsibleState.None, 'phantomdave-gittown-wrapper.hack'),
                new GitTownItem('Ship (Merge & Delete)', vscode.TreeItemCollapsibleState.None, 'phantomdave-gittown-wrapper.ship'),
                new GitTownItem('Propose (Create PR)', vscode.TreeItemCollapsibleState.None, 'phantomdave-gittown-wrapper.propose'),
            ];
        }

        return [];
    }
}