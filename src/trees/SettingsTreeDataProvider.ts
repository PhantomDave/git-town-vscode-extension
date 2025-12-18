import * as vscode from 'vscode';
import { SettingsItem } from '../items/settingItem';
import { isGitTownInstalled } from '../utils';

export class SettingsTreeDataProvider implements vscode.TreeDataProvider<SettingsItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SettingsItem | undefined | null | void> = new vscode.EventEmitter<SettingsItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SettingsItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: SettingsItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: SettingsItem): Promise<SettingsItem[]> {
        if (!element) {
            const version = await isGitTownInstalled();
            const versionText = version ? `Version: ${version}` : 'Not Installed';
            
            return [
                new SettingsItem(versionText),
                new SettingsItem('Open Documentation', 'https://www.git-town.com'),
                new SettingsItem('View Output Logs', 'showOutput'),
            ];
        }
        return [];
    }
}