import { BuildExecutorSchema } from "./schema";
import { ExecutorContext, createPackageJson, writeJsonFile } from '@nrwl/devkit';
import { execSync } from 'child_process';
import path = require('path');
import { copy } from 'fs-extra';
import { PackageJson } from 'nx/src/utils/package-json';

const KEYSTONE_BUILT_ARTIFACTS = ['./.keystone/', './schema.graphql', './schema.prisma', './node_modules'];
const KEYSTONE_MOVE_SOURCE_FILES = ['keystone.ts', './admin', './migrations', './tsconfig.json'];

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
	const srcFolder = path.join(context.cwd, options.root);
	const destFolder = path.join(context.cwd, options.outputPath);

	if (!options.dontBuild) {
		// Run keystone build
		execSync('npx keystone postinstall --fix', { cwd: srcFolder, stdio: 'inherit' });
		execSync('npx keystone build', { cwd: srcFolder, stdio: 'inherit' });
	}

	// Move folder to dist
	await Promise.all(
		[
			...(options.dontBuild ? KEYSTONE_MOVE_SOURCE_FILES : KEYSTONE_BUILT_ARTIFACTS).map(artifact => {
				return copy(path.join(srcFolder, artifact), path.join(destFolder, artifact))
			}),
			...options?.filesToInclude.map(file => {
				return copy(path.join(srcFolder, file), path.join(destFolder, file))
			})
		]
	);

	// Generate package.json
	const builtPackageJson = createPackageJson(
		context.projectName,
		context.projectGraph,
		{
			root: context.root,
			isProduction: true,
		}
	);
	updatePackageJson(builtPackageJson, context);
	writeJsonFile(`${options.outputPath}/package.json`, builtPackageJson);

	console.log("Executor ran for Keystone Build");
	return {
		success: true,
	};
}

// Taken from @nrwl/next, relevant as Keystone uses NextJS
function updatePackageJson(
	packageJson: PackageJson,
	context: ExecutorContext
) {
	if (!packageJson.scripts) {
		packageJson.scripts = {};
	}
	packageJson.scripts.start = 'keystone start';

	const typescriptNode = context.projectGraph.externalNodes['npm:typescript'];
	if (typescriptNode) {
		packageJson.dependencies = packageJson.dependencies || {};
		packageJson.dependencies['typescript'] = typescriptNode.data.version;
	}
}
