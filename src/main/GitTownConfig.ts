import { runCommandInLocalFolder } from "../utils";

export interface GitTownConfig {
    mainBranch: string;
    perennialBranches: string[];
    perennialRegex?: string;
    prototypeNames: string[];
    parkedBranches: string[];
}

/**
 * Retrieves a git configuration value.
 * 
 * VS Code API Context:
 * Uses child_process to execute git commands and parse output.
 */
export async function getGitConfig(key: string): Promise<string> {
    try {
        const result = await runCommandInLocalFolder(`git config --get ${key}`);
        if(result.error) {
            return '';
        }
        return result.output?.trim() || '';
    } catch (error) {
        return '';
    }
}

/**
 * Retrieves multiple values for a git configuration key.
 * Used for configs that can have multiple values (e.g., perennial branches).
 */
export async function getGitConfigAll(key: string): Promise<string[]> {
    try {
        const result = await runCommandInLocalFolder(`git config --get-all ${key}`);
        return result.output?.split('\n').filter(line => line.trim() !== '') || [];
    } catch (error) {
        return [];
    }
}

/**
 * Parses git-town configuration from git config.
 * Git-town stores configuration in git config using keys like:
 * - git-town.main-branch
 * - git-town.perennial-branches
 * - git-town.perennial-regex
 * - git-town.prototype-branches
 * - git-town.parked-branches
 */
export async function parseGitTownConfig(): Promise<GitTownConfig> {
    const [
        mainBranch,
        perennialBranches,
        perennialRegex,
        prototypeNames,
        parkedBranches
    ] = await Promise.all([
        getGitConfig('git-town.main-branch'),
        getGitConfigAll('git-town.perennial-branches'),
        getGitConfig('git-town.perennial-regex'),
        getGitConfigAll('git-town.prototype-branches'),
        getGitConfigAll('git-town.parked-branches')
    ]);

    return {
        mainBranch: mainBranch || 'main',
        perennialBranches: perennialBranches,
        perennialRegex: perennialRegex || undefined,
        prototypeNames: prototypeNames,
        parkedBranches: parkedBranches
    };
}