import * as vscode from 'vscode';
import { GitTownItem } from '../items/gitTownItem';

export class GitTownTreeDataProvider implements vscode.TreeDataProvider<GitTownItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<GitTownItem | undefined | null | void> = new vscode.EventEmitter<GitTownItem | undefined | null | void>();
    onDidChangeTreeData: vscode.Event<GitTownItem | undefined | null | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: GitTownItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: GitTownItem): Thenable<GitTownItem[]> {
        if (!element) {
            return Promise.resolve([
                new GitTownItem('Status', vscode.TreeItemCollapsibleState.None),
                new GitTownItem('Branches', vscode.TreeItemCollapsibleState.None),
                new GitTownItem('Workflows', vscode.TreeItemCollapsibleState.None),
            ]);
        }
        return Promise.resolve([]);
    }
}