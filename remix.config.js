/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  publicPath: "/build/", // default value, can be removed
  serverBuildPath: "functions/[[path]].js",
  serverConditions: ["worker"],
  serverDependenciesToBundle: "all",
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverModuleFormat: "esm", // default value in 2.x, can be removed once upgraded
  serverPlatform: "neutral",
};
