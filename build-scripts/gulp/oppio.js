const gulp = require("gulp");

const envVars = require("../env");

require("./clean.js");
require("./gen-icons.js");
require("./webpack.js");
require("./compress.js");

gulp.task(
  "develop-oppio",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "development";
    },
    "clean-oppio",
    gulp.parallel("gen-icons-oppio", "gen-icons-mdi"),
    "webpack-watch-oppio"
  )
);

gulp.task(
  "build-oppio",
  gulp.series(
    async function setEnv() {
      process.env.NODE_ENV = "production";
    },
    "clean-oppio",
    gulp.parallel("gen-icons-oppio", "gen-icons-mdi"),
    "webpack-prod-oppio",
    ...// Don't compress running tests
    (envVars.isTravis ? [] : ["compress-oppio"])
  )
);
