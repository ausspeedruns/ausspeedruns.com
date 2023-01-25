export interface BuildExecutorSchema {
	root: string;
	outputPath: string;
	dontBuild?: boolean;
	filesToInclude?: string[];
}
