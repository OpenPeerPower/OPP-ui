#!/usr/bin/env node
const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

function patch(version) {
  const parts = version.split(".");
  return `${parts[0]}.${parts[1]}.${Number(parts[2]) + 1}`;
}

function minor(version) {
  const parts = version.split(".");
  return `${parts[0]}.${Number(parts[1]) + 1}.0`;
}

function major(version) {
  const parts = version.split(".");
  return `${Number(parts[0]) + 1}.0.0`;
}

const methods = {
  patch,
  minor,
  major,
};

async function main(args) {
  const method = args.length > 0 && methods[args[0]];
  const commit = args.length > 1 && args[1] == "--commit";

  if (!method) {
    console.error(
      "Missing required method. Choose from",
      Object.keys(methods).join(", ")
    );
    return;
  }

  const setup = fs.readFileSync("setup.py", "utf8");
  const version = setup.match(/\d+\.\d+\.\d+/)[0];
  const newVersion = method(version);

  console.log("Current version:", version);
  console.log("New version:", newVersion);

  fs.writeFileSync("setup.py", setup.replace(version, newVersion), "utf-8");

  if (!commit) {
    return;
  }

  const { stdout } = await exec(
    `git commit -am "Bumped version to ${newVersion}"`
  );
  console.log(stdout);
}

main(process.argv.slice(2)).catch(console.error);
