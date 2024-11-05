const path_s = require("path");
const nodeExternals_s = require("webpack-node-externals");

module.exports = {
	entry: ["./src/server.ts"],
	resolve: {
		extensions: [".ts"]
	},
	target: "node",
	mode: "production",
	externals: [nodeExternals_s()],
	output: {
		path: path_s.resolve(__dirname, "dist"),
		filename: "bundle.js"
	},
	module: {
		rules: [
			// all files with a `.ts` extension will be handled by `ts-loader`
			{ test: /\.ts$/, loader: "ts-loader" }
		]
	}
};
