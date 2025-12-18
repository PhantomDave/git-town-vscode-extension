# Git Town VS Code Wrapper - Implementation Plan

## Overview

This document outlines a phased approach to take the git-town VS Code wrapper from **25% complete to a functional MVP (v0.1.0)** in 3-4 weeks. The plan focuses on security, reliability, and core workflow support.

### Timeline
- **Phase 1 (Week 1)**: Foundation & Security
- **Phase 2 (Week 2)**: Core Workflows
- **Phase 3 (Week 3)**: Polish & Testing
- **Phase 4 (Week 4)**: MVP Release Prep

### Current Status
- Extension Infrastructure: **90%**
- UI Scaffolding: **40%**
- Basic Commands: **50%**
- Advanced Commands: **5%**
- Configuration: **10%**
- Error Handling: **20%**
- Testing: **5%**

---

## Phase 1: Foundation & Security (Week 1)

### 1.1 Fix Shell Injection Vulnerability
**Priority**: 🔴 CRITICAL  
**Effort**: 2-3 hours  
**Files**: `src/utils.ts`

**What**: Sanitize user input before passing to shell commands (branch names, commit messages)

**Current Issue**:
- User input (branch names) passed directly to shell commands
- Vulnerable to command injection with special characters

**Solution**:
- Use proper shell escaping for all user inputs
- Wrap user input in quotes with escape sequences
- Create `escapeShellArg()` utility function

**Acceptance Criteria**:
- Branch names with special chars (spaces, `$()`, backticks, quotes) work safely
- No shell injection possible through user inputs
- All commands properly quoted

**Testing**:
- Create branch with name: `feature/test$(whoami)`
- Create branch with name: `feature/test "quoted"`
- Create branch with name: `feature/test with spaces`

---

### 1.2 Remove Skeleton Artifacts
**Priority**: 🟡 MEDIUM  
**Effort**: 30 minutes  
**Files**: `package.json`, `src/extension.ts`

**What**: Remove unused `helloWorld` command and its registration

**Current Issue**:
- Extension has skeleton `helloWorld` command that serves no purpose
- Creates confusion in command palette

**Solution**:
1. Remove from `package.json` `contributes.commands` array
2. Remove command registration from `src/extension.ts`
3. Remove activation event if only bound to this command

**Acceptance Criteria**:
- `helloWorld` command no longer exists
- No references in code
- Command palette doesn't show it

---

### 1.3 Add Command Result Validation
**Priority**: 🔴 CRITICAL  
**Effort**: 3-4 hours  
**Files**: `src/utils.ts`, `src/extension.ts`

**What**: Wrap `runCommandInLocalFolder()` to validate command success and provide structured error feedback

**Current Issue**:
- Terminal shows errors but extension doesn't react
- Command failures don't prevent UI updates
- No way to know if command succeeded programmatically

**Solution**:
1. Create `CommandResult` interface with `success: boolean`, `output: string`, `error?: string`
2. Modify `runCommandInLocalFolder()` to return `CommandResult`
3. Add git-town specific error detection
4. Throw descriptive errors for common failures:
   - "Not initialized" error
   - "Merge conflict" error
   - "Branch not found" error
   - etc.

**Acceptance Criteria**:
- Failed commands return `success: false`
- Error messages are descriptive and actionable
- Commands that fail don't update UI state
- Users see error dialogs for failures

**Testing**:
- Run command in non-git directory (should fail)
- Run sync on uninitialized repo (should fail)
- Verify error messages are helpful

---

### 1.4 Implement Command Execution State Management
**Priority**: 🟡 MEDIUM  
**Effort**: 2-3 hours  
**Files**: `src/extension.ts`, `src/trees/GitTownTreeDataProvider.ts`

**What**: Track which commands are running to show loading states

**Current Issue**:
- No visual feedback when commands execute
- Users unsure if operation completed or is frozen
- Multiple concurrent commands can cause race conditions

**Solution**:
1. Add `executingCommands: Set<string>` to extension state
2. Disable tree item commands during execution
3. Add loading spinner icon to executing commands
4. Queue commands to prevent concurrent execution

**Acceptance Criteria**:
- Workflow buttons disable during execution
- Show loading spinner/icon during execution
- Single command executes at a time
- After completion, state resets

**Testing**:
- Click sync, verify button disables and shows loading state
- Wait for completion, verify state resets
- Try rapid clicks (should queue, not execute concurrently)

---

### 1.5 Add Keyboard Shortcuts
**Priority**: 🟡 MEDIUM  
**Effort**: 1 hour  
**Files**: `package.json`

**What**: Register keyboard shortcuts for 3 most-used commands

**Solution**:
Add `keybindings` contribution section with shortcuts:
- `Ctrl+K H` - Hack (new branch)
- `Ctrl+K S` - Sync
- `Ctrl+K P` - Propose

**Acceptance Criteria**:
- Shortcuts work and execute commands
- Don't conflict with VS Code defaults
- Documented in README

**Testing**:
- Press each shortcut in a git-town repo
- Verify correct command executes

---

### 1.6 Fix Tree Refresh Debouncing
**Priority**: 🟡 MEDIUM  
**Effort**: 2-3 hours  
**Files**: `src/trees/GitTownTreeDataProvider.ts`, `src/trees/SettingsTreeDataProvider.ts`

**What**: Debounce rapid `refresh()` calls to prevent excessive re-renders

**Current Issue**:
- Multiple operations trigger tree refreshes
- Rapid re-renders cause performance issues
- Shell calls happen unnecessarily

**Solution**:
1. Create `debounce()` utility function
2. Wrap `_onDidChangeTreeData.fire()` calls
3. Set 500ms debounce window

**Acceptance Criteria**:
- 5 rapid refreshes result in only 1 tree update
- Tree still updates appropriately after operations
- No noticeable lag

---

## Phase 2: Core Workflows (Week 2)

### 2.1 Implement Branch Type Detection & Categorization
**Priority**: 🔴 CRITICAL  
**Effort**: 4-5 hours  
**Files**: `src/utils.ts`, `src/trees/GitTownTreeDataProvider.ts`

**What**: Detect and display branch types (feature, perennial, prototype, parked)

**Current Issue**:
- All branches look the same
- Users can't distinguish branch purposes
- No parent-child relationship display

**Solution**:
1. Create `BranchInfo` interface with `name`, `type`, `parent`, `isPrototype`, `isDraft`
2. Add function to parse git-town metadata from git config
3. Categorize branches in tree under headers:
   - **Current Branch**
   - **Feature Branches**
   - **Perennial Branches**
   - **Prototype Branches** (if any)
   - **Parked Branches** (if any)
4. Add icons per type:
   - 🌿 Feature branches
   - 📌 Perennial branches
   - 🧪 Prototype branches
   - 📦 Parked branches

**Acceptance Criteria**:
- Branches grouped by type
- Each type has distinct icon/styling
- Shows parent branch for features
- Updates correctly after branch operations

**Testing**:
- Initialize git-town, verify main branch shows as perennial
- Create feature branch, verify it groups correctly
- Create stacked branches, verify parent shown

---

### 2.2 Implement Append & Prepend Commands
**Priority**: 🔴 CRITICAL  
**Effort**: 4-5 hours  
**Files**: `src/extension.ts`, `src/utils.ts`

**What**: Register and implement `append` (create child) and `prepend` (create parent) commands

**Current Issue**:
- Stacked changes are core git-town feature
- Commands registered but not fully functional
- No branch selection UI for these operations

**Solution**:
1. Create command handlers for `append` and `prepend`
2. For `append`: Show quick pick of available branches to append to
3. For `prepend`: Show input for new parent branch name
4. Execute commands with proper error handling
5. Refresh tree after successful operation

**Acceptance Criteria**:
- Can create child branch from any feature branch
- Can create parent branch and rebase on it
- Proper branch selection UI (quick pick)
- Helpful error messages

**Testing**:
- Create feature branch (hack)
- Append child branch
- Verify relationship in tree
- Prepend parent branch
- Verify entire stack works

---

### 2.3 Implement Continue & Skip Commands
**Priority**: 🟡 MEDIUM  
**Effort**: 3-4 hours  
**Files**: `src/extension.ts`, `src/utils.ts`

**What**: Register `continue` (resume after conflicts) and `skip` (skip branch during sync)

**Current Issue**:
- Error recovery essential for workflow
- Users stuck if merge conflict occurs
- No way to skip branches during sync

**Solution**:
1. Create command handlers for `continue` and `skip`
2. `continue`: Show confirmation dialog, execute command
3. `skip`: Show branch picker, execute with that branch
4. After `continue`, suggest user resolve conflicts manually
5. Add helpful messages

**Acceptance Criteria**:
- After merge conflict, can run `continue`
- Can skip specific branches during sync
- Proper confirmation dialogs
- Helpful guidance

**Testing**:
- Create scenario with merge conflict
- Verify `continue` works after manual resolution
- Test `skip` on sync operation

---

### 2.4 Implement Rename Command
**Priority**: 🟡 MEDIUM  
**Effort**: 2-3 hours  
**Files**: `src/extension.ts`, `src/utils.ts`

**What**: Register `rename` command for branches

**Current Issue**:
- Users need ability to fix branch names
- Currently not available in wrapper

**Solution**:
1. Create command handler for `rename`
2. Show input dialog with current branch name as placeholder
3. Validate new name (required, not empty)
4. Execute command
5. Refresh tree

**Acceptance Criteria**:
- Can rename current branch
- Input validation works
- Can rename branches from tree context menu
- Tree updates after rename

**Testing**:
- Rename current branch
- Verify name changes
- Try invalid names (should fail gracefully)

---

### 2.5 Implement Status Command
**Priority**: 🟡 MEDIUM  
**Effort**: 3-4 hours  
**Files**: `src/extension.ts`, `src/utils.ts`, `src/trees/GitTownTreeDataProvider.ts`

**What**: Add overall git-town status display to main tree view

**Current Issue**:
- Users can't see full repository state at a glance
- No summary of branches, configuration, etc.

**Solution**:
1. Add "Repository Status" collapsible item at top of tree
2. Call `git town status` and parse output
3. Display:
   - Main branch
   - Perennial branches
   - Current branch with ancestry
   - Any active/paused operations
   - Configuration summary
4. Format as expandable tree items

**Acceptance Criteria**:
- Status item shows repository overview
- Updates on refresh
- Shows all relevant information
- Doesn't slow down tree rendering

**Testing**:
- Verify status shows current state
- Create branches, refresh, verify updates
- Check output parsing doesn't crash

---

### 2.6 Add Interactive Branch Actions (Context Menu)
**Priority**: 🟡 MEDIUM  
**Effort**: 4-5 hours  
**Files**: `package.json`, `src/extension.ts`, `src/trees/GitTownTreeDataProvider.ts`

**What**: Right-click branch items to perform actions

**Current Issue**:
- All operations require going to sidebar commands
- No quick branch-specific operations

**Solution**:
1. Register context menu contribution for tree items
2. Add commands:
   - Switch to branch
   - Rename branch
   - Ship branch (delete)
   - Propose (create PR)
   - Show in tree (jump to branch)
3. Implement command handlers
4. Add "when" clause to only show on branches

**Acceptance Criteria**:
- Right-click branch shows context menu
- All operations work from context menu
- Menu items appropriate to branch type
- No errors or crashes

**Testing**:
- Right-click various branches
- Execute each context menu action
- Verify tree updates correctly

---

### 2.7 Implement Auto-Refresh on File Changes
**Priority**: 🟡 MEDIUM  
**Effort**: 2-3 hours  
**Files**: `src/extension.ts`

**What**: Watch for git changes and auto-refresh tree views

**Current Issue**:
- Tree requires manual refresh after operations
- User experience broken without auto-refresh

**Solution**:
1. Use `vscode.workspace.onDidChangeTextDocument` and `vscode.window.onDidChangeActiveTextEditor`
2. Detect `.git/` directory changes
3. Debounce refresh to prevent excessive updates
4. Auto-refresh both tree views

**Acceptance Criteria**:
- Tree updates automatically after operations
- Debouncing prevents excessive refreshes
- User doesn't need to click refresh
- Performance acceptable

**Testing**:
- Run sync, verify tree updates automatically
- Run hack, verify new branch appears
- Run ship, verify branch disappears

---

## Phase 3: Polish & Testing (Week 3)

### 3.1 Create Configuration/Settings UI
**Priority**: 🟡 MEDIUM  
**Effort**: 5-6 hours  
**Files**: `src/trees/SettingsTreeDataProvider.ts`, `src/items/settingItem.ts`, `package.json`, new `src/services/ConfigService.ts`

**What**: Interactive settings panel to configure git-town in extension

**Current Issue**:
- Users must use CLI to configure git-town
- Settings view only shows version and links
- No way to manage configuration from UI

**Solution**:
1. Create `ConfigService` to read/write git config
2. Redesign Settings view with editable items:
   - Main branch (read-only display, but editable via git-town init)
   - Perennial branches (collapsible list)
   - Prototype branches (collapsible list)
   - Parked branches (collapsible list)
   - Sync strategy dropdown (merge/rebase/squash)
   - Ship strategy dropdown (api/merge/squash/fast-forward)
3. Add "edit" buttons that trigger input dialogs
4. Store changes in git config

**Acceptance Criteria**:
- All major settings visible and editable
- Changes persist in git config
- Helpful descriptions for each setting
- No crashes or validation errors

**Testing**:
- Change each setting
- Verify saved to git config
- Verify reflected in tree after refresh

---

### 3.2 Implement Undo Command
**Priority**: 🟡 MEDIUM  
**Effort**: 2-3 hours  
**Files**: `src/extension.ts`, `src/utils.ts`

**What**: Register `undo` command to revert last git-town operation

**Current Issue**:
- Users need safety net for accidental operations
- No way to recover from mistakes

**Solution**:
1. Create command handler for `undo`
2. Show confirmation dialog
3. Execute `git town undo`
4. Show result message
5. Refresh tree

**Acceptance Criteria**:
- Can undo last operation
- Confirmation prevents accidental undo
- Works reliably
- Clear success/failure messages

**Testing**:
- Create branch, undo, verify it's deleted
- Try undo with no operations, verify error
- Multiple undo calls

---

### 3.3 Add Error Recovery & Helpful Messages
**Priority**: 🟡 MEDIUM  
**Effort**: 4-5 hours  
**Files**: `src/utils.ts`, `src/extension.ts`

**What**: Parse git-town error messages and provide actionable help

**Current Issue**:
- Error messages often cryptic
- Users don't know how to resolve
- No contextual help

**Solution**:
1. Create error handler that parses git-town output
2. Detect patterns:
   - "Not a git repository" → "Install Git or initialize repo"
   - "git-town not initialized" → "Run `git town init` first" (with link to docs)
   - "Merge conflict" → "Resolve conflicts then run `continue`"
   - "Remote branch missing" → "Run `git fetch` and try again"
   - "Branch already exists" → "Choose a different branch name"
3. Show user-friendly messages with actionable steps
4. Link to relevant documentation

**Acceptance Criteria**:
- Error messages are helpful and actionable
- Common errors have recovery suggestions
- Links to documentation provided
- Users can recover without CLI

**Testing**:
- Trigger various error conditions
- Verify helpful messages appear
- Follow suggestions, verify they work

---

### 3.4 Implement Switch Command
**Priority**: 🟡 MEDIUM  
**Effort**: 3-4 hours  
**Files**: `src/extension.ts`, `src/utils.ts`

**What**: Visual branch switcher using quick pick UI

**Current Issue**:
- Switching branches requires tree navigation or CLI
- Could be faster with quick pick

**Solution**:
1. Create command handler for switch
2. Get all branches via `getGitTownBranches()`
3. Show quick pick with:
   - Current branch marked with icon
   - Branches grouped by type
   - Branch ancestry shown
4. Execute `git checkout <branch>` on selection
5. Refresh tree

**Acceptance Criteria**:
- Quick pick shows all branches
- Current branch clearly marked
- Can quickly search/filter branches
- Switching works reliably

**Testing**:
- Run switch command
- Verify all branches appear
- Select different branch
- Verify checkout succeeds

---

### 3.5 Write Unit Tests
**Priority**: 🔴 CRITICAL  
**Effort**: 6-8 hours  
**Files**: `src/test/extension.test.ts`, new test files

**What**: Achieve 60%+ test coverage for utility functions

**Coverage Targets**:
- `src/utils.ts`: 70%+
- `src/trees/GitTownTreeDataProvider.ts`: 50%+
- `src/trees/SettingsTreeDataProvider.ts`: 40%+
- `src/items/*.ts`: 80%+

**What to Test**:
1. Utility functions:
   - `isGitRepository()` - mock git commands
   - `isGitTownInstalled()` - mock version output
   - `isGitTownInitialized()` - mock git config
   - `getCurrentBranch()` - mock branch output
   - `getGitTownBranches()` - mock branch list
   - `getUncommittedChangesCount()` - mock status
   - Error handling - mock failures

2. Tree data providers:
   - `getChildren()` returns correct items
   - `refresh()` triggers updates
   - Root items correct
   - Nested items correct

3. Item models:
   - Correct labels and tooltips
   - Icons applied correctly
   - Commands assigned properly

**Acceptance Criteria**:
- 60%+ overall line coverage
- All utility functions tested
- Core tree provider logic tested
- All tests passing

**Testing Framework**: Mocha + Chai (already in devDependencies)

---

### 3.6 Improve Documentation
**Priority**: 🟡 MEDIUM  
**Effort**: 3-4 hours  
**Files**: `README.md`, new `DEVELOPMENT.md`, new `WORKFLOWS.md`, new `TROUBLESHOOTING.md`

**What to Document**:

**README.md** - User-focused:
- Feature overview with screenshots
- Installation instructions
- Basic usage examples
- Keyboard shortcuts
- Configuration guide
- Troubleshooting section
- Link to git-town docs

**DEVELOPMENT.md** - Developer-focused:
- Setup instructions
- Project structure
- How to add new commands
- Running tests
- Building/packaging
- Contributing guidelines

**WORKFLOWS.md** - Workflow guide:
- Common workflows explained
- Step-by-step examples
- Best practices
- Stacking changes guide

**TROUBLESHOOTING.md** - Common issues:
- Installation issues
- Initialization issues
- Command failures
- Performance issues
- FAQ

**Acceptance Criteria**:
- README explains all features
- New users can get started
- Troubleshooting covers 90% of issues
- Developer guide clear and complete

---

## Phase 4: MVP Release Prep (Week 4)

### 4.1 Performance Optimization
**Priority**: 🟡 MEDIUM  
**Effort**: 3-4 hours  
**Files**: `src/utils.ts`, `src/trees/GitTownTreeDataProvider.ts`

**What**: Implement caching for expensive operations

**Solution**:
1. Create `CacheService` with configurable TTL
2. Cache `getGitTownBranches()` for 5 seconds
3. Cache status output for 3 seconds
4. Lazy-load branch details (only on expand)
5. Cache current branch for 2 seconds

**Acceptance Criteria**:
- Tree operations complete in <500ms (vs current 1-2s)
- Shell calls reduced by 70%+
- No stale data shown to users
- Caching transparent to user

**Testing**:
- Measure response times
- Verify no stale data
- Test rapid operations

---

### 4.2 Edge Case Testing
**Priority**: 🟡 MEDIUM  
**Effort**: 4-5 hours  
**Files**: All

**What**: Manual test common edge cases

**Test Scenarios**:
1. Repository with 100+ branches
   - Verify tree renders without lag
   - Search/filter works
   - All branches accessible
2. Very long branch names (50+ chars)
   - Display doesn't break
   - Names truncated with ellipsis
   - Full name in tooltip
3. Special characters in names
   - Unicode characters
   - Spaces, quotes, parentheses
   - Paths with slashes
4. Offline scenario (no remote)
   - Commands that don't require remote work
   - Helpful errors for remote operations
5. Active merge conflicts
   - Tree shows warning
   - `continue` command visible
   - Clear recovery instructions
6. Detached HEAD state
   - Tree shows current state
   - Operations suggest checkout
   - No crashes
7. Shallow/partial clones
   - Operations work or fail gracefully
   - Clear error messages
8. Large monorepo
   - Extension only considers relevant .git
   - Performance acceptable

**Acceptance Criteria**:
- No crashes on edge cases
- Graceful error handling
- Clear user guidance
- Performance acceptable

---

### 4.3 Marketplace Assets
**Priority**: 🟡 MEDIUM  
**Effort**: 4-5 hours  
**Files**: `package.json`, new `images/` folder

**What to Create**:
1. **Extension Icon** (128x128px)
   - Git-town themed
   - Clear at small sizes
   - Professional appearance
2. **Feature Screenshots** (showing):
   - Tree view with branches
   - Workflow execution
   - Settings panel
   - Context menus
3. **Demo GIF** (10-15 seconds)
   - Show quick workflow
   - Hack → Sync → Ship
   - Clear and engaging
4. **package.json entries**:
   - `icon` field pointing to icon
   - `repository` field
   - `bugs` field
   - `publisher` field (marketplace requirement)
   - `homepage` field

**Acceptance Criteria**:
- Professional-looking icon
- Clear, helpful screenshots
- Engaging demo GIF
- All marketplace fields complete

---

### 4.4 Version & Release Notes
**Priority**: 🟡 MEDIUM  
**Effort**: 1-2 hours  
**Files**: `package.json`, `CHANGELOG.md`

**What to Do**:
1. Update `package.json` version to `0.1.0`
2. Update `CHANGELOG.md`:
   - **v0.1.0 (First MVP)** section with:
     - Features added
     - Bug fixes
     - Known limitations
     - Next priorities
3. Create **ROADMAP.md**:
   - v0.2.0 features
   - v1.0.0 goals
   - Future ideas

**Acceptance Criteria**:
- Version updated consistently
- Clear release notes
- Roadmap published
- Semantic versioning followed

---

### 4.5 Final Integration Testing
**Priority**: 🔴 CRITICAL  
**Effort**: 4-5 hours  
**Files**: All

**Test Checklist**:

**Setup**:
- [ ] Extension activates without errors
- [ ] All commands registered
- [ ] Tree views appear
- [ ] Settings view loads

**Main Workflows**:
- [ ] Initialize git-town in new repo
- [ ] Create feature branch (`hack`)
- [ ] Create stacked branch (`append`)
- [ ] Sync all branches
- [ ] Ship feature branch
- [ ] Rename branch
- [ ] Continue after simulated conflict
- [ ] Undo operation

**Edge Cases**:
- [ ] Large branch lists (50+ branches)
- [ ] Special characters in names
- [ ] Long operation times (sync large repo)
- [ ] Rapid command execution
- [ ] Network disconnection (no remote)

**UI/UX**:
- [ ] Tree updates properly
- [ ] Error messages helpful
- [ ] No crashes or hangs
- [ ] Keyboard shortcuts work
- [ ] Context menus work

**Acceptance Criteria**:
- All workflows complete without errors
- No crashes or hangs
- Error messages helpful
- Performance acceptable

---

### 4.6 Code Quality & Linting
**Priority**: 🟡 MEDIUM  
**Effort**: 2-3 hours  
**Files**: All

**Quality Checks**:

Run all checks:
```bash
npm run check-types    # TypeScript strict mode
npm run lint          # ESLint
npm run compile       # Full build
npm test              # Unit tests
```

**Acceptance Criteria**:
- `npm run check-types` - 0 errors
- `npm run lint` - 0 errors, 0 warnings
- `npm run compile` - 0 errors
- `npm test` - All passing, 60%+ coverage

---

## Implementation Tracking

### High-Level Timeline

```
WEEK 1: Foundation & Security
├── Day 1: 1.1 (Shell injection) + 1.2 (Cleanup)
├── Day 2: 1.3 (Command validation)
├── Day 3: 1.4 (State management) + 1.5 (Shortcuts)
├── Day 4: 1.6 (Debouncing) + Initial testing
└── Day 5: Testing & bug fixes

WEEK 2: Core Workflows
├── Day 1: 2.1 (Branch categorization)
├── Day 2: 2.2 (Append/Prepend)
├── Day 3: 2.3 (Continue/Skip) + 2.4 (Rename)
├── Day 4: 2.5 (Status) + 2.6 (Context menus)
└── Day 5: 2.7 (Auto-refresh) + Testing

WEEK 3: Polish & Testing
├── Day 1: 3.1 (Settings UI)
├── Day 2: 3.2 (Undo) + 3.3 (Error recovery)
├── Day 3: 3.4 (Switch) + 3.5 (Tests - part 1)
├── Day 4: 3.5 (Tests - part 2) + 3.6 (Docs)
└── Day 5: Testing & refinement

WEEK 4: MVP Release
├── Day 1: 4.1 (Performance) + 4.2 (Edge cases)
├── Day 2: 4.3 (Marketplace assets)
├── Day 3: 4.4 (Release notes) + 4.5 (Integration testing)
├── Day 4: 4.6 (Code quality) + Final testing
└── Day 5: Release! 🎉
```

### Task Dependencies

```
Phase 1 (Foundation)
└── 1.1 (Shell injection) [BLOCKS all other work]
└── 1.3 (Command validation) [BLOCKS Phase 2]

Phase 2 (Workflows)
├── Depends on: 1.1 + 1.3 + 1.4
├── 2.1 (Branch categorization)
├── 2.2 (Append/Prepend)
├── 2.3 (Continue/Skip)
├── 2.4 (Rename)
├── 2.5 (Status)
├── 2.6 (Context menus)
└── 2.7 (Auto-refresh)

Phase 3 (Polish)
├── Depends on: Phase 2 complete
├── 3.1 (Settings UI)
├── 3.2 (Undo)
├── 3.3 (Error recovery)
├── 3.4 (Switch)
├── 3.5 (Tests)
└── 3.6 (Docs)

Phase 4 (Release)
└── Depends on: Phases 1-3 complete
```

### Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Git-town version incompatibility | Medium | High | Add version detection, support `>= 7.0.0` |
| Complex merge conflicts | Low | High | Add conflict resolution UI in Phase 3.3 |
| Performance with large repos | Medium | Medium | Implement caching in Phase 4.1 |
| User confusion on stacking | Medium | Medium | Detailed docs in WORKFLOWS.md + UI hints |
| Keyboard shortcut conflicts | Low | Low | Test against VS Code defaults first |
| Shell escaping edge cases | Low | Medium | Test with fuzzing library in Phase 3 |

---

## Architecture Decisions

### 1. Git-town Version Support
**Decision**: Support git-town `>= 7.0.0`  
**Rationale**: 
- Stable API across these versions
- Don't have to support legacy versions
- Document in README

### 2. Configuration Storage
**Decision**: Use `git config` as primary source  
**Rationale**:
- Config is part of repository (shareable)
- Aligns with git-town philosophy
- Can be committed to repo

### 3. Command Execution Model
**Decision**: Keep terminal-based execution (vs Node API)  
**Rationale**:
- Interactive commands need user input
- Users expect to see git-town output
- Fewer dependencies on Node packages
- Works across platforms reliably

### 4. State Management
**Decision**: Extension context object + tree data providers  
**Rationale**:
- Simple, doesn't require Vuex/Redux
- Built into VS Code APIs
- Sufficient for MVP scope

### 5. Proposal/PR Integration
**Decision**: NO for MVP (Future v1.0)  
**Rationale**:
- Requires GitHub/GitLab API auth
- Adds significant complexity
- Can be separate feature later

---

## Success Criteria for MVP (v0.1.0)

✅ **Phase 1** - All tasks complete
- [x] Shell injection fixed
- [x] Command validation working
- [x] State management implemented
- [x] Keyboard shortcuts added
- [x] Debouncing working

✅ **Phase 2** - Core workflows implemented
- [x] Branch categorization visible
- [x] Append/Prepend working
- [x] Continue/Skip implemented
- [x] Rename working
- [x] Status display implemented
- [x] Context menus functional
- [x] Auto-refresh working

✅ **Phase 3** - Polish & testing
- [x] Settings UI complete
- [x] Undo implemented
- [x] Error recovery helpful
- [x] Switch command working
- [x] 60%+ test coverage
- [x] Documentation complete

✅ **Phase 4** - Release ready
- [x] Performance optimized (500ms tree operations)
- [x] Edge cases handled gracefully
- [x] Marketplace assets ready
- [x] Version bumped to 0.1.0
- [x] Full integration tests passing
- [x] 0 linting errors
- [x] 0 TypeScript errors
- [x] All tests passing

### Expected Coverage
- **Feature Implementation**: 70-75% of common workflows
- **Test Coverage**: 60%+ of code
- **Error Handling**: Covers 90% of failure scenarios
- **Documentation**: Sufficient for new users to get started

---

## Post-MVP Roadmap

### v0.2.0 (Weeks 5-6)
- Draft/prototype branch support
- Branch lineage visualization
- Switch command enhancement
- Performance profiling
- User feedback incorporation

### v1.0.0 (Weeks 7-12)
- Proposal/PR integration with GitHub/GitLab
- Web-based branch visualization
- Conflict resolution UI
- Full keyboard navigation
- Complete test coverage (85%+)
- Marketplace polish

### v1.5.0+ (Future)
- Dark/light theme support
- Customizable keybindings
- Telemetry (opt-in)
- Repository comparison
- Team collaboration features

---

## Getting Started

1. **Before Starting**: Read this entire document
2. **Development Setup**: See `DEVELOPMENT.md`
3. **Track Progress**: Update status in each section as you complete tasks
4. **Test Regularly**: Don't wait until Phase 4 to test
5. **Commit Often**: Small commits for each task
6. **Document Changes**: Update README as features are added

---

## Questions & Decisions to Make

- [ ] Should we publish to VS Code marketplace at v0.1.0 or wait for v1.0?
- [ ] What git-town version should be minimum requirement?
- [ ] Should we support git (non-town) operations or focus purely on git-town?
- [ ] Any extension dependencies we should consider (e.g., Peacock for visual hints)?

---

## Contact & Support

For questions about this plan:
- Review git-town documentation: https://www.git-town.com
- Check VS Code Extension API: https://code.visualstudio.com/api
- Review existing issues/discussions in repository
