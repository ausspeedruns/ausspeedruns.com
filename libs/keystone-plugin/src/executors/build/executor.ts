import { BuildExecutorSchema } from "./schema";
import { ExecutorContext, createPackageJson, writeJsonFile } from '@nrwl/devkit';
import { execSync } from 'child_process';
import path = require('path');
import { copy } from 'fs-extra';
import { PackageJson } from 'nx/src/utils/package-json';

const KEYSTONE_BUILT_ARTIFACTS = ['./.keystone/', './schema.graphql', './schema.prisma', './node_modules'];

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
	const srcFolder = path.join(context.cwd, options.root);
	const destFolder = path.join(context.cwd, options.outputPath);

	// Run keystone build
	execSync('npx keystone build', { cwd: srcFolder, stdio: 'inherit' });

	// Move folder to dist
	await Promise.all(
		KEYSTONE_BUILT_ARTIFACTS.map(artifact => {
			return copy(path.join(srcFolder, artifact), path.join(destFolder, artifact))
		})
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

	console.log("Executor ran for Keystone Build", options);
	return {
		success: true,
	};
}

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

function calculateCwd(
	cwd: string | undefined,
	context: ExecutorContext
): string {
	if (!cwd) return context.root;
	if (path.isAbsolute(cwd)) return cwd;
	return path.join(context.root, cwd);
}
