export interface IProgramProvider {
	Version: string;

	Init(force?: boolean): Promise<void>;

	List(): Promise<void>;

	Add(repoArg: string, base?: string): Promise<void>;

	Update(repoArg: string, base: string): Promise<void>;

	Remove(repoArg: string): Promise<void>;

	Execute(): Promise<void>;
}
