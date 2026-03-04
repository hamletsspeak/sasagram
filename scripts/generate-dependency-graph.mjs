import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, "dependency-graph.svg");
const depcruiseArgs = ["--config", ".dependency-cruiser.cjs", "--output-type", "dot", "src"];
const depcruiseEntry = path.join(
  projectRoot,
  "node_modules",
  "dependency-cruiser",
  "bin",
  "dependency-cruise.mjs"
);

function splitPathEnv(value) {
  return (value ?? "")
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getDotCandidates() {
  const candidates = [];

  for (const entry of splitPathEnv(process.env.PATH)) {
    candidates.push(path.join(entry, "dot.exe"));
    candidates.push(path.join(entry, "dot"));
  }

  candidates.push("C:\\Program Files\\Graphviz\\bin\\dot.exe");
  candidates.push("C:\\Program Files (x86)\\Graphviz\\bin\\dot.exe");

  return candidates;
}

function resolveDotCommand() {
  for (const candidate of getDotCandidates()) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

const dotCommand = resolveDotCommand();

if (!dotCommand) {
  console.error(
    "Graphviz dot executable not found. Install Graphviz or add its bin directory to PATH."
  );
  process.exit(1);
}

const depcruise = spawnSync(process.execPath, [depcruiseEntry, ...depcruiseArgs], {
  cwd: projectRoot,
  encoding: "utf8",
});

if (depcruise.status !== 0) {
  if (depcruise.stderr) {
    process.stderr.write(depcruise.stderr);
  }
  if (depcruise.error) {
    console.error(depcruise.error.message);
  }
  process.exit(depcruise.status ?? 1);
}

const dot = spawnSync(dotCommand, ["-Tsvg", "-o", outputFile], {
  cwd: projectRoot,
  input: depcruise.stdout,
  encoding: "utf8",
});

if (dot.status !== 0) {
  if (dot.stderr) {
    process.stderr.write(dot.stderr);
  }
  if (dot.error) {
    console.error(dot.error.message);
  }
  process.exit(dot.status ?? 1);
}

if (!existsSync(outputFile)) {
  console.error(`Dependency graph was not created at ${outputFile}`);
  process.exit(1);
}

console.log(`Dependency graph written to ${outputFile}`);
