# GitHub Workflows Setup Guide

This document explains how to configure the GitHub Actions workflows for this repository, particularly the automated changelog updates and auto-approval system.

## Overview

This repository uses several automated workflows:

1. **Update CHANGELOG** (`update-changelog.yml`) - Automatically creates PRs to update `CHANGELOG.md` when PRs are merged to `main`
2. **Auto Approve** (`auto-approve.yml`) - Automatically approves PRs created by bots (like changelog updates) after CI passes
3. **CI** (`ci.yml`) and **Main CI** (`main.yml`) - Run tests and checks on PRs

## The Token Problem

By default, when a GitHub Action creates a PR using the built-in `GITHUB_TOKEN`, GitHub **intentionally does not trigger other workflows** on that PR. This is a security feature to prevent recursive workflow runs.

This means:
- The `update-changelog.yml` workflow creates a PR ✅
- But CI workflows don't run on that PR ❌
- So the `auto-approve.yml` workflow never triggers ❌
- The PR must be manually reviewed and merged 😞

## Solution: Use a Personal Access Token (PAT)

To enable full automation (auto-approval of changelog PRs), you need to configure a Personal Access Token.

### Step 1: Create a Personal Access Token

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a descriptive name like `git-town-extension-workflows`
4. Set expiration (recommend: 90 days or 1 year)
5. Select the following scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't be able to see it again!)

### Step 2: Add Token as Repository Secret

1. Go to your repository settings: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click **"New repository secret"**
3. Name: `PAT` (or `GH_PAT`)
4. Value: Paste the token you copied
5. Click **"Add secret"**

### Step 3: Verify It Works

1. Merge a PR to `main` (not a changelog PR)
2. The `update-changelog.yml` workflow should run and create a changelog PR
3. The CI workflows should run on the changelog PR
4. Once CI passes, the `auto-approve.yml` workflow should approve it automatically

## Alternative: Manual Approval

If you don't want to set up a PAT, the workflows will still function but with limitations:

- ✅ Changelog PRs will be created automatically
- ❌ CI won't run automatically on changelog PRs
- ❌ Auto-approve won't trigger
- 👤 You'll need to manually approve and merge changelog PRs

To trigger CI manually on a changelog PR:
1. Close and reopen the PR, OR
2. Push an empty commit to the PR branch, OR
3. Manually trigger the workflow from the Actions tab

## Token Security

### Best Practices

- **Use a dedicated bot account**: Create a separate GitHub account for automation
- **Set token expiration**: Don't use tokens that never expire
- **Use minimal scopes**: Only grant `repo` and `workflow` permissions
- **Rotate regularly**: Update the token every 90 days
- **Monitor usage**: Check the token's usage in GitHub settings

### What Can Go Wrong?

- **Token expires**: Workflows will fall back to `GITHUB_TOKEN` (manual approval needed)
- **Token revoked**: Same as expiration
- **Token leaked**: Immediately revoke it and create a new one
- **Insufficient permissions**: Ensure `repo` and `workflow` scopes are enabled

## Troubleshooting

### Changelog PR Created But CI Doesn't Run

**Cause**: Using `GITHUB_TOKEN` instead of a PAT

**Solution**: Follow the steps above to add a PAT as `PAT` or `GH_PAT` secret

### Auto-Approve Workflow Doesn't Trigger

**Cause**: CI workflows didn't complete successfully

**Solution**: 
1. Check the CI workflow run logs
2. Fix any failing tests or checks
3. Push fixes to the PR branch

### Auto-Approve Runs But Doesn't Approve

**Cause**: Check the workflow conditions in `auto-approve.yml`

**Common reasons**:
- PR author is not `github-actions[bot]` or `dependabot[bot]`
- Workflow run didn't succeed
- PR was not created by the workflow actor
- No PRs associated with the workflow run

**Solution**: Review the workflow logs to see which condition failed

## Workflow Diagram

```
PR merged to main
        ↓
update-changelog.yml runs
        ↓
Creates changelog PR (with PAT: triggers CI, without PAT: no CI)
        ↓
CI and Main CI workflows run (only if PAT used)
        ↓
CI completes successfully
        ↓
auto-approve.yml triggers on workflow_run completion
        ↓
Checks conditions (bot author, CI success, etc.)
        ↓
Approves the changelog PR ✅
```

## Additional Resources

- [GitHub Actions: Triggering a workflow from a workflow](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow#triggering-a-workflow-from-a-workflow)
- [Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## Questions?

If you have questions about this setup, please:
1. Review the workflow files in `.github/workflows/`
2. Check the Actions tab for workflow run logs
3. Open an issue if you find a bug or need help
