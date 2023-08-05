import { BuildExecutorSchema } from "./schema";
import { ExecutorContext, writeJsonFile, logger } from "@nx/devkit";
import { createPackageJson } from "@nx/js";
import { execSync } from "child_process";
import path = require("path");
import { copy } from "fs-extra";
import { PackageJson } from "nx/src/utils/package-json";

const KEYSTONE_BUILT_ARTIFACTS = ["./.keystone/", "./schema.graphql", "./schema.prisma", "./node_modules"];
const PRISMA_ARTIFACTS = "../../node_modules/.prisma";

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
	if (!context.projectName) {
		logger.error("Keystone Project does not have a project name");
		return { success: false };
	}

	if (!context.projectGraph) {
		logger.error("Keystone Project does not have a project graph");
		return { success: false };
	}

	const srcFolder = path.join(context.cwd, options.root);
	const destFolder = path.join(context.cwd, options.outputPath);

	// Run keystone build
	execSync("npx keystone build", { cwd: srcFolder, stdio: "inherit" });

	// Move folder to dist
	await Promise.all(
		KEYSTONE_BUILT_ARTIFACTS.map((artifact) => {
			return copy(path.join(srcFolder, artifact), path.join(destFolder, artifact));
		}),
	);

	// Move prisma to dist
	await copy(path.join(srcFolder, PRISMA_ARTIFACTS), path.join(destFolder, "/node_modules/.prisma"));

	// Generate package.json
	const builtPackageJson = createPackageJson(context.projectName, context.projectGraph, {
		root: context.root,
		isProduction: true,
	});
	updatePackageJson(builtPackageJson, context);
	writeJsonFile(`${options.outputPath}/package.json`, builtPackageJson);

	console.log("Executor ran for Keystone Build");
	return {
		success: true,
	};
}

// Taken from @nx/next, relevant as Keystone uses NextJS
function updatePackageJson(packageJson: PackageJson, context: ExecutorContext) {
	if (!context.projectGraph?.externalNodes) {
		logger.error("Keystone Project does not have a project graph");
		return;
	}
	
	if (!packageJson.scripts) {
		packageJson.scripts = {};
	}
	packageJson.scripts.start = "keystone start";

	if (!packageJson.dependencies) {
		packageJson.dependencies = {};
	}

	const requiredPackages = ['react', 'react-dom', 'next', 'typescript'];
	for (const pkg of requiredPackages) {
	  const externalNode = context.projectGraph.externalNodes[`npm:${pkg}`];
	  if (externalNode) {
		packageJson.dependencies[pkg] ??= externalNode.data.version;
	  }
	}
}
