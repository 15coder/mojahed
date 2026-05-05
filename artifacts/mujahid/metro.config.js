const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/drizzle-orm_tmp_.*/,
  /node_modules\/.*_tmp_\d+.*/,
  /\.local[/\\].*/,
];

module.exports = config;
