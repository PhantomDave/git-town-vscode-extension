import * as vscode from 'vscode';

type QueueItem = {
  name: string;
  action: () => Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
};

const commandStateEmitter = new vscode.EventEmitter<void>();
export const onCommandStateChanged = commandStateEmitter.event;

export const executingCommands = new Set<string>();

const commandQueue: QueueItem[] = [];
let isProcessingQueue = false;

export function enqueueCommandExecution(name: string, action: () => Promise<void>): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    commandQueue.push({ name, action, resolve, reject });
    processQueue();
  });
}

async function processQueue(): Promise<void> {
  if (isProcessingQueue || commandQueue.length === 0) {
    return;
  }

  const nextCommand = commandQueue.shift()!;
  isProcessingQueue = true;
  executingCommands.add(nextCommand.name);
  commandStateEmitter.fire();

  try {
    await nextCommand.action();
    nextCommand.resolve();
  } catch (error) {
    nextCommand.reject(error);
  } finally {
    executingCommands.delete(nextCommand.name);
    isProcessingQueue = false;
    commandStateEmitter.fire();
    processQueue();
  }
}

export function isAnyCommandExecuting(): boolean {
  return executingCommands.size > 0;
}
