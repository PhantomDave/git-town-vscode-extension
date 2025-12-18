import * as assert from 'assert';
import { enqueueCommandExecution, executingCommands, isAnyCommandExecuting, onCommandStateChanged } from '../commandState';

suite('Command State Tests', () => {
  test('enqueueCommandExecution executes action and resolves promise', async () => {
    let executed = false;
    await enqueueCommandExecution('test-1', async () => {
      executed = true;
    });

    assert.strictEqual(executed, true, 'Action should have executed');
  });

  test('enqueueCommandExecution adds command to executingCommands', async () => {
    const promise = enqueueCommandExecution('test-executing', async () => {
      assert.strictEqual(executingCommands.has('test-executing'), true, 'Command should be in executing set');
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    await promise;
    assert.strictEqual(executingCommands.has('test-executing'), false, 'Command should be removed after completion');
  });

  test('enqueueCommandExecution serializes command execution', async () => {
    const executionOrder: string[] = [];

    const promise1 = enqueueCommandExecution('cmd-1', async () => {
      executionOrder.push('start-1');
      await new Promise(resolve => setTimeout(resolve, 50));
      executionOrder.push('end-1');
    });

    const promise2 = enqueueCommandExecution('cmd-2', async () => {
      executionOrder.push('start-2');
      await new Promise(resolve => setTimeout(resolve, 10));
      executionOrder.push('end-2');
    });

    await Promise.all([promise1, promise2]);

    // Verify commands executed serially, not in parallel
    assert.deepStrictEqual(
      executionOrder,
      ['start-1', 'end-1', 'start-2', 'end-2'],
      'Commands should execute serially in order'
    );
  });

  test('isAnyCommandExecuting returns true when commands are running', async () => {
    assert.strictEqual(isAnyCommandExecuting(), false, 'Should be false initially');

    const promise = enqueueCommandExecution('test-busy', async () => {
      assert.strictEqual(isAnyCommandExecuting(), true, 'Should be true during execution');
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    await promise;
    assert.strictEqual(isAnyCommandExecuting(), false, 'Should be false after completion');
  });

  test('enqueueCommandExecution rejects promise on error', async () => {
    try {
      await enqueueCommandExecution('error-cmd', async () => {
        throw new Error('Test error');
      });
      assert.fail('Should have thrown error');
    } catch (error) {
      assert.strictEqual((error as Error).message, 'Test error');
    }
  });

  test('onCommandStateChanged fires when command execution state changes', async () => {
    const stateChanges: number[] = [];

    const listener = onCommandStateChanged(() => {
      stateChanges.push(stateChanges.length);
    });

    await enqueueCommandExecution('state-test', async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Should have fired when command started and when it ended
    assert.strictEqual(stateChanges.length >= 2, true, 'Event should have fired at least twice');

    listener.dispose();
  });

  test('executingCommands set clears all commands after serial execution', async () => {
    const promise1 = enqueueCommandExecution('multi-1', async () => {
      await new Promise(resolve => setTimeout(resolve, 30));
    });

    const promise2 = enqueueCommandExecution('multi-2', async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    await promise1;
    await promise2;

    assert.strictEqual(executingCommands.size, 0, 'All commands should be cleared');
  });
});
