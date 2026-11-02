import { readFile, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { prepareReleaseData, resolveVersion, VERSION_FILES } from './release-library.mjs'

const RELEASE_BRANCH = 'master'

function run(command, arguments_, options = {}) {
	const result = spawnSync(command, arguments_, { encoding: 'utf8', stdio: options.capture ? 'pipe' : 'inherit' })
	if (result.status !== 0) {
		const detail = options.capture ? `\n${result.stderr || result.stdout}` : ''
		throw new Error(`${command} ${arguments_.join(' ')} failed${detail}`)
	}
	return options.capture ? result.stdout.trim() : ''
}

function tryRun(command, arguments_) {
	return spawnSync(command, arguments_, { encoding: 'utf8', stdio: 'pipe' })
}

const requestedVersion = process.argv[2]
if (!requestedVersion) {
	throw new Error('Usage: pnpm release <major|minor|patch|major.minor.patch>')
}

const branch = run('git', ['branch', '--show-current'], { capture: true })
if (branch !== RELEASE_BRANCH) {
	throw new Error(`Releases must run from ${RELEASE_BRANCH}; current branch is ${branch || 'detached'}`)
}
if (run('git', ['status', '--porcelain'], { capture: true })) {
	throw new Error('Working tree is not clean. Commit or stash changes before releasing.')
}

run('git', ['fetch', 'origin', RELEASE_BRANCH, '--tags'])
const localHead = run('git', ['rev-parse', 'HEAD'], { capture: true })
const remoteHead = run('git', ['rev-parse', `origin/${RELEASE_BRANCH}`], { capture: true })
if (localHead !== remoteHead) {
	throw new Error(`Local ${RELEASE_BRANCH} must exactly match origin/${RELEASE_BRANCH} before releasing.`)
}

const entries = await Promise.all(VERSION_FILES.map(async name => [
	name,
	JSON.parse(await readFile(new URL(`../${name}`, import.meta.url), 'utf8'))
]))
const data = Object.fromEntries(entries)
const version = resolveVersion(data['package.json'].version, requestedVersion)
prepareReleaseData(data, version)
await Promise.all(entries.map(([name]) =>
	writeFile(new URL(`../${name}`, import.meta.url), `${JSON.stringify(data[name], undefined, '\t')}\n`)
))

run('pnpm', ['build'])
run(process.execPath, ['scripts/verify-release.mjs', version])
run('git', ['add', ...VERSION_FILES])
if (tryRun('git', ['diff', '--cached', '--quiet']).status !== 0) {
	run('git', ['commit', '-m', `Release ${version}`])
}

const releaseCommit = run('git', ['rev-parse', 'HEAD'], { capture: true })
const localTag = tryRun('git', ['rev-parse', '-q', '--verify', `refs/tags/${version}^{commit}`])
if (localTag.status === 0 && localTag.stdout.trim() !== releaseCommit) {
	throw new Error(`Tag ${version} already points to another commit; refusing to move it.`)
}
if (localTag.status !== 0) run('git', ['tag', '-a', version, '-m', version])

const remoteTags = run('git', ['ls-remote', '--tags', 'origin', `refs/tags/${version}`, `refs/tags/${version}^{}`], { capture: true })
const remoteTagCommit = remoteTags.split('\n').find(line => line.endsWith(`refs/tags/${version}^{}`))?.split(/\s+/)[0]
	?? remoteTags.split('\n').find(Boolean)?.split(/\s+/)[0]
if (remoteTagCommit && remoteTagCommit !== releaseCommit) {
	throw new Error(`Remote tag ${version} already points to another commit; refusing to move it.`)
}

run('git', ['push', 'origin', `HEAD:${RELEASE_BRANCH}`])
if (remoteTagCommit) {
	run('gh', ['workflow', 'run', 'release.yml', '--ref', RELEASE_BRANCH, '-f', `version=${version}`])
	console.log(`Release ${version} already had a tag; started the repair workflow.`)
}
else {
	run('git', ['push', 'origin', `refs/tags/${version}`])
	console.log(`Release ${version} pushed. GitHub Actions will publish it automatically.`)
}
