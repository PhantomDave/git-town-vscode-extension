import * as vscode from 'vscode';

export class MockOutputChannel implements vscode.OutputChannel {
  name: string = 'Mock Output';
  lines: string[] = [];

  append(value: string): void {
    this.lines.push(value);
  }

  appendLine(value: string): void {
    this.lines.push(value);
  }

  clear(): void {
    this.lines = [];
  }

  show(preserveFocusOrColumn?: boolean | vscode.ViewColumn, preserveFocus?: boolean): void {
    // no-op
  }

  hide(): void {
    // no-op
  }

  dispose(): void {
    this.clear();
  }

  replace(value: string): void {
    // no-op
  }
}

export class MockTreeDataProvider<T> implements vscode.TreeDataProvider<T> {
  private _onDidChangeTreeData = new vscode.EventEmitter<T | undefined | null | void>();
  onDidChangeTreeData = this._onDidChangeTreeData.event;

  async getChildren(element?: T): Promise<T[]> {
    return [];
  }

  getTreeItem(element: T): vscode.TreeItem {
    return new vscode.TreeItem('mock');
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

export class MockTerminal implements vscode.Terminal {
  name: string = 'Mock Terminal';
  processId: Promise<number> = Promise.resolve(0);
  creationOptions: vscode.TerminalOptions & { isOpen: boolean };
  exitStatus: vscode.TerminalExitStatus | undefined;
  state: any = 'Open';
  shellIntegration: vscode.TerminalShellIntegration | undefined;

  sentText: string[] = [];

  constructor(options?: Partial<vscode.TerminalOptions>) {
    this.creationOptions = {
      ...options,
      isOpen: true,
    } as any;
  }

  sendText(text: string, addNewLine?: boolean): void {
    this.sentText.push(text);
  }

  show(preserveFocus?: boolean): void {
    // no-op
  }

  hide(): void {
    // no-op
  }

  dispose(): void {
    // no-op
  }
}
