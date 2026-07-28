#!/usr/bin/env node
/**
 * Cross-platform Gradle wrapper launcher.
 *
 * The root package.json used to call `cd backend && ./gradlew`, which fails on Windows:
 * cmd.exe has no `./` and resolves the wrong file. Every backend script therefore had to
 * be run by hand from `backend/` with `gradlew.bat`. This picks the right wrapper for the
 * platform so `npm run build:backend` works everywhere.
 *
 * Usage: node scripts/gradlew.mjs <gradle args...>
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'backend');
const isWindows = process.platform === 'win32';
const args = process.argv.slice(2);

// Always use the absolute path: cmd.exe does not search the child process cwd for a
// bare `gradlew.bat`, and the repo path can contain spaces.
const wrapper = path.join(backendDir, isWindows ? 'gradlew.bat' : 'gradlew');

// Gradle needs JVM 17+ and the toolchain in build.gradle asks for 25. Machines often
// still have an old JRE first on PATH, and Gradle's own message ("configured to use
// JVM 8") does not say what to do about it. Fail early with something actionable.
if (!process.env.JAVA_HOME) {
  console.error(
    [
      'JAVA_HOME is not set.',
      '',
      'The backend needs a JDK 25 (Gradle itself requires 17+). If one is installed,',
      'point JAVA_HOME at it; a bare JRE on PATH is not enough.',
      '',
      'Windows, once, for your user account:',
      '  setx JAVA_HOME "C:\\Program Files\\Eclipse Adoptium\\jdk-25.0.4.7-hotspot"',
      'then open a new terminal.',
      '',
      'macOS / Linux:',
      '  export JAVA_HOME="$(/usr/libexec/java_home -v 25)"   # or your distro path',
    ].join('\n'),
  );
  process.exit(1);
}

/**
 * Quotes an argument for cmd.exe only when it needs it, so Gradle still sees flags
 * like `--tests` and `-Pfoo=bar` unchanged.
 *
 * @param {string} value
 * @returns {string}
 */
const quoteForCmd = (value) => (/[\s"&|<>^]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

// A .bat needs a shell. Node deprecates passing an args array alongside shell:true
// (DEP0190), so on Windows the command line is assembled here instead.
const child = isWindows
  ? spawn([quoteForCmd(wrapper), ...args.map(quoteForCmd)].join(' '), {
      cwd: backendDir,
      stdio: 'inherit',
      shell: true,
    })
  : spawn(wrapper, args, { cwd: backendDir, stdio: 'inherit' });

child.on('error', (error) => {
  console.error(`Failed to start the Gradle wrapper at ${wrapper}: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  // Propagate the real outcome so CI and the verify gate see a genuine failure.
  process.exit(signal ? 1 : (code ?? 1));
});
