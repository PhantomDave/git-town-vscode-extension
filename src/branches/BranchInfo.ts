import { GitTownConfig, parseGitTownConfig } from "../main/GitTownConfig";
import { getAllBranches, getBranchParent, getCurrentBranch } from "../utils";
import { BranchType, classifyBranch } from "./BranchType";

export interface BranchInfo {
    name: string;
    type: BranchType;
    parent?: string;  // Parent branch name for stacked changes
    isPrototype: boolean;
    isParked: boolean;
    isPerennial: boolean;
    isCurrent: boolean;
}

/**
 * Builds complete BranchInfo object with all metadata.
 * This is the main function to get branch information.
 */
export async function getBranchInfo(
    branchName: string,
    currentBranch: string,
    config: GitTownConfig
): Promise<BranchInfo> {
    const type = classifyBranch(branchName, currentBranch, config);
    const parent = await getBranchParent(branchName);

    return {
        name: branchName,
        type: type,
        parent: parent,
        isPrototype: config.prototypeNames.includes(branchName),
        isParked: config.parkedBranches.includes(branchName),
        isPerennial: type === BranchType.PERENNIAL,
        isCurrent: branchName === currentBranch
    };
}

/**
 * Gets complete branch information for all branches in the repository.
 * Returns array of BranchInfo objects with all metadata populated.
 */
export async function getAllBranchInfo(): Promise<BranchInfo[]> {
    const [branches, currentBranch, config] = await Promise.all([
        getAllBranches(),
        getCurrentBranch(),
        parseGitTownConfig()
    ]);

    // Build branch info for all branches in parallel
    const branchInfoPromises = branches.map(branchName =>
        getBranchInfo(branchName, currentBranch, config)
    );

    return Promise.all(branchInfoPromises);
}