/* eslint-disable */
export default {
	displayName: "keystone-plugin-e2e",
	preset: "../../jest.preset.js",
	globals: {},
	transform: {
		"^.+\\.[tj]s$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/tsconfig.spec.json",
			},
		],
	},
	moduleFileExtensions: ["ts", "js", "html"],
	coverageDirectory: "../../coverage/apps/keystone-plugin-e2e",
};
