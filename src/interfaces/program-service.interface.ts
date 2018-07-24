export interface IProgramService {
	Version: string;

	List(): Promise<void>;

	Add(repoArg: string, base?: string): Promise<void>;

	Update(repoArg: string, base: string): Promise<void>;

	Remove(repoArg: string): Promise<void>;

	Import(config: string): Promise<void>;

	Export(prettyPrint: boolean | undefined): Promise<void>;

	Execute(): Promise<void>;
}
