import * as migration_20261026_120803_initial from "./20261026_120803_initial.ts";

export const migrations = [
	{
		up: migration_20261026_120803_initial.up,
		down: migration_20261026_120803_initial.down,
		name: "20261026_120803_initial",
	},
];
