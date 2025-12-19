import { GitTownConfig } from "../main/GitTownConfig";

export enum BranchType {
    FEATURE = 'feature',
    PERENNIAL = 'perennial',
    PROTOTYPE = 'prototype',
    PARKED = 'parked',
    CURRENT = 'current',
    UNKNOWN = 'unknown'
}

/**
 * Determines the type of a branch based on git-town configuration.
 * 
 * Classification Logic:
 * 1. Current branch → CURRENT type
 * 2. Parked branches → PARKED type
 * 3. Prototype branches → PROTOTYPE type
 * 4. Perennial branches (main, develop, etc.) → PERENNIAL type
 * 5. All others → FEATURE type
 */
export function classifyBranch(
    branchName: string,
    currentBranch: string,
    config: GitTownConfig
): BranchType {
    // Check if current branch
    if (branchName === currentBranch) {
        return BranchType.CURRENT;
    }

    // Check if parked
    if (config.parkedBranches.includes(branchName)) {
        return BranchType.PARKED;
    }

    // Check if prototype
    if (config.prototypeNames.includes(branchName)) {
        return BranchType.PROTOTYPE;
    }

    // Check if perennial (main branch or in perennial list)
    if (branchName === config.mainBranch || config.perennialBranches.includes(branchName)) {
        return BranchType.PERENNIAL;
    }

    // Check perennial regex if defined
    if (config.perennialRegex) {
        try {
            const regex = new RegExp(config.perennialRegex);
            if (regex.test(branchName)) {
                return BranchType.PERENNIAL;
            }
        } catch (error) {
            console.error('Invalid perennial regex:', config.perennialRegex);
        }
    }

    // Default to feature branch
    return BranchType.FEATURE;
}