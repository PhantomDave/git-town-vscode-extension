import * as vscode from 'vscode';
import { SettingsItem } from '../items/settingItem';

export class SettingsTreeDataProvider implements vscode.TreeDataProvider<SettingsItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SettingsItem | undefined | null | void> = new vscode.EventEmitter<SettingsItem | undefined | null | void>();
    onDidChangeTreeData: vscode.Event<SettingsItem | undefined | null | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: SettingsItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SettingsItem): Thenable<SettingsItem[]> {
        if (!element) {
            return Promise.resolve([
                new SettingsItem('Git Town Version'),
                new SettingsItem('Configuration'),
                new SettingsItem('Help & Documentation'),
            ]);
        }
        return Promise.resolve([]);
    }
}