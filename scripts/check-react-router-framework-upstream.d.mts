export interface UpstreamChange {
  kind: string;
  status: string;
  path: string;
  oldPath?: string;
}

export interface CategorizedUpstreamChanges {
  directoriesWithAddedFiles: string[];
  added: string[];
  modified: string[];
  deleted: string[];
  renamed: UpstreamChange[];
  other: UpstreamChange[];
}

export interface UpstreamAuditOptions {
  sourceRoot: string;
  baseRef: string;
  targetRef?: string;
  sourceDirs: string[];
}

export interface UpstreamAudit extends CategorizedUpstreamChanges {
  baseCommit: string;
  targetCommit: string;
}

export declare const parseNameStatus: (
  output: Buffer | string
) => UpstreamChange[];
export declare const categorizeChanges: (
  changes: UpstreamChange[]
) => CategorizedUpstreamChanges;
export declare const auditUpstream: (
  options: UpstreamAuditOptions
) => UpstreamAudit;
export declare const printAudit: (audit: UpstreamAudit) => void;
