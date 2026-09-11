#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Prerelease Publish Script
 *
 * This script uses the Nx Release programmatic API to publish prerelease
 * versions of packages under a given npm dist-tag. It backs every
 * non-production publish flow in this repo:
 *
 * - `alpha`: one build per PR, tagged uniquely per commit so concurrent PRs
 *   never clobber each other's installable version (tag defaults to preid).
 * - `next`: one build per merge to `main`, published under a single stable
 *   `next` dist-tag that always points at the latest build (preid still
 *   varies per commit so every version string stays unique).
 * - `beta`: one build per merge to `beta`, published under a single stable
 *   `beta` dist-tag, same mechanics as `next` one step further down the
 *   branch flow (main -> beta -> production).
 *
 * Usage:
 *   npx nx run gamut-release:publish --preid=alpha.abc123 [--manifest]
 *   npx nx run gamut-release:publish --preid=next.abc123 --tag=next [--dry-run] [--manifest]
 */

import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { Command } from '@commander-js/extra-typings';
import {
  createProjectGraphAsync,
  readJsonFile,
  workspaceRoot,
} from '@nx/devkit';
import { releasePublish, releaseVersion } from 'nx/release/index.js';

type PrereleaseOptions = {
  preid: string;
  tag?: string;
  dryRun?: boolean;
  verbose?: boolean;
  manifest?: string | boolean;
};

type VersionDataEntry = {
  currentVersion: string;
  newVersion: string | null;
};

type ProjectsVersionData = Record<string, VersionDataEntry>;

type PublishManifestEntry = {
  name: string;
  version: string;
  previousVersion: string;
};

function resolveManifestPath(
  manifestArg: PrereleaseOptions['manifest']
): string | null {
  if (manifestArg === true) {
    return 'publish-manifest.json';
  }

  if (typeof manifestArg === 'string' && manifestArg.trim()) {
    return manifestArg;
  }

  return null;
}

/**
 * Build a manifest of published packages using the project graph to resolve
 * package.json names for each Nx project.
 */
async function buildPublishManifest(
  projectNames: string[],
  projectsVersionData: ProjectsVersionData
): Promise<PublishManifestEntry[]> {
  if (projectNames.length === 0) {
    return [];
  }

  const projectGraph = await createProjectGraphAsync({ exitOnError: true });
  const entries: PublishManifestEntry[] = [];

  for (const projectName of projectNames) {
    const project = projectGraph.nodes[projectName];
    if (!project) {
      throw new Error(
        `Manifest requested but project "${projectName}" not found in project graph.`
      );
    }

    const packageJsonPath = join(
      workspaceRoot,
      project.data.root,
      'package.json'
    );
    const packageJson = readJsonFile<{ name?: string }>(packageJsonPath);
    if (!packageJson?.name) {
      throw new Error(
        `Manifest requested but package name missing in "${packageJsonPath}".`
      );
    }

    const versionData = projectsVersionData[projectName];
    const version = versionData?.newVersion ?? versionData?.currentVersion;
    const previousVersion = versionData?.currentVersion;
    if (!version || !previousVersion) {
      throw new Error(
        `Manifest requested but version data missing for "${projectName}".`
      );
    }

    entries.push({ name: packageJson.name, version, previousVersion });
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

const program = new Command()
  .name('gamut-release-publish')
  .description(
    'Publish prerelease versions of packages using Nx Release, under a given npm dist-tag.'
  )
  .requiredOption(
    '--preid <preid>',
    'Prerelease identifier used in the version string, e.g. alpha.abc123 or next.abc123'
  )
  .option(
    '--tag <tag>',
    'npm dist-tag to publish under (defaults to --preid, matching per-build unique tags like alpha)'
  )
  .option('-d, --dry-run', 'Run without publishing')
  .option('--verbose', 'Enable verbose logging')
  .option(
    '--manifest [path]',
    'Write JSON manifest of published packages (default: publish-manifest.json)'
  );

program.parse(process.argv);

const options = program.opts();

const preidArg = options.preid;
const tagArg = options.tag ?? preidArg;
const dryRun = options.dryRun ?? false;
const verbose = options.verbose ?? false;
const manifestPath = resolveManifestPath(options.manifest);
const manifestOutputPath = manifestPath
  ? resolve(process.cwd(), manifestPath)
  : null;

async function releasePrerelease(): Promise<never> {
  console.log(
    `📦 Starting prerelease publish with preid: ${preidArg} (tag: ${tagArg})`
  );
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }

  try {
    // Step 1: Version all packages as prerelease
    console.log('\n🔢 Running versioning step...');
    const { workspaceVersion, projectsVersionData } = await releaseVersion({
      specifier: 'prerelease',
      preid: preidArg,
      stageChanges: false,
      gitCommit: false,
      gitTag: false,
      dryRun,
      verbose,
    });

    console.log('\n📝 Versioning complete:');
    if (workspaceVersion) {
      console.log(`  Workspace version: ${workspaceVersion}`);
    }

    // Log versioned projects
    const versionedProjects = Object.entries(projectsVersionData);
    if (versionedProjects.length > 0) {
      console.log(`  ${versionedProjects.length} projects versioned:`);
      versionedProjects.forEach(([projectName, data]) => {
        console.log(`    - ${projectName}: ${data.newVersion}`);
      });
    }

    // Step 2: Publish packages under the requested dist-tag
    console.log(`\n📤 Publishing packages with tag: ${tagArg}...`);
    const publishStatus = await releasePublish({
      tag: tagArg,
      dryRun,
      verbose,
    });

    // Check publish results
    console.log('\n✅ Publishing complete:');
    const results = Object.entries(publishStatus);
    const successful = results.filter(([, status]) => status.code === 0);
    const failed = results.filter(([, status]) => status.code !== 0);
    const successfulProjects = successful.map(([project]) => project);

    console.log(`  Successful: ${successful.length}`);
    if (failed.length > 0) {
      console.log(`  Failed: ${failed.length}`);
      failed.forEach(([project, status]) => {
        console.error(`    - ${project}: exit code ${status.code}`);
      });
    }

    let exitCode = failed.length > 0 ? 1 : 0;

    if (manifestOutputPath) {
      try {
        const manifestEntries = await buildPublishManifest(
          successfulProjects,
          projectsVersionData
        );
        await writeFile(
          manifestOutputPath,
          `${JSON.stringify(manifestEntries, null, 2)}\n`
        );
        console.log(
          `\n📄 Wrote publish manifest to: ${manifestOutputPath}`
        );
      } catch (error) {
        console.error('\n❌ Failed to write publish manifest:');
        console.error(error);
        exitCode = 1;
      }
    }

    process.exit(exitCode);
  } catch (error) {
    console.error('\n❌ Prerelease publish failed:');
    console.error(error);
    process.exit(1);
  }
}

void releasePrerelease();
