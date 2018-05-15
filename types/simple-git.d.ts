declare module "simple-git" {
    function init(workingDirectory?: string): SimpleGit;
    export default init;
}

declare class SimpleGit {
    public clone(repoPath: string): Promise<void>;
    public clone(repoPath: string, localPath: string): Promise<void>;
    public clone(repoPath: string, options: string[]): Promise<void>;
    public clone(repoPath: string, handlerFn: (err: any) => void): Promise<void>;
    public clone(repoPath: string, localPath: string, handlerFn: (err: any) => void): Promise<void>;
    public clone(repoPath: string, options: string[], handlerFn: (err: any) => void): Promise<void>;
    public clone(repoPath: string, localPath: string, options: string[], handlerFn: (err: any) => void): Promise<void>;

    public log(handlerFn: (err: any, commits: ListLogSummary) => void): void;
    public log(options: object, handlerFn: (err: any, commits: ListLogSummary) => void): void;
    public log(options: string[], handlerFn: (err: any, commits: ListLogSummary) => void): void;

    public tags(handlerFn: (err: any, tags: TagsCollection) => void): void;
    public tags(options: any[], handlerFn: (err: any, tags: TagsCollection) => void): void;

    public raw(args: string[]): void;
    public raw(args: string[], handlerFn: (err: any, result: string) => void): void;
}

declare class TagsCollection {
    public latest: string;
    public all: string[];
}

declare class ListLogSummary {
    public all: any[];
    public latest: any;
    public total: number;
}