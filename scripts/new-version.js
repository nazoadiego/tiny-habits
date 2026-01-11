import { readFile, writeFile } from 'node:fs/promises'
import { readFileSync, writeFileSync } from 'node:fs'
import readline from 'node:readline/promises'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)
const packageJsonPath = new URL('../package.json', import.meta.url)
const currentVersion = process.env.npm_package_version

async function askVersion() {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

	try {
		const answer = await rl.question(`Current version is ${currentVersion}. Enter the next version: `)
		const trimmed = answer.trim()
		if (!trimmed) {
			throw new Error('No version entered')
		}
		if (trimmed === currentVersion) {
			throw new Error('New version must differ from the current version')
		}
		return trimmed
	}
	finally {
		rl.close()
	}
}

async function updatePackageVersion(newVersion) {
	const raw = await readFile(packageJsonPath, 'utf8')
	const packageJson = JSON.parse(raw)

	packageJson.version = newVersion

	await writeFile(packageJsonPath, JSON.stringify(packageJson, undefined, '\t') + '\n')

	return newVersion
}


async function updateManifest(newVersion) {
// read minAppVersion from manifest.json and bump version to target version
	const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'))
	const { minAppVersion } = manifest
	manifest.version = newVersion
	writeFileSync('manifest.json', JSON.stringify(manifest, undefined, '\t'))

	// update versions.json with target version and minAppVersion from manifest.json
	const versions = JSON.parse(readFileSync('versions.json', 'utf8'))

	if (newVersion) {
		versions[newVersion] = minAppVersion
		writeFileSync('versions.json', JSON.stringify(versions, undefined, '\t'))
	}
}

async function runCommand(command) {
	const { stdout, stderr } = await execAsync(command)
	if (stdout) process.stdout.write(stdout)
	if (stderr) process.stderr.write(stderr)
}

async function main() {
	const newVersion = await askVersion()
	await updatePackageVersion(newVersion)
	console.log(`Updated package.json to ${newVersion}`)
	await updateManifest(newVersion)
	await runCommand('git add manifest.json versions.json package.json')
	await runCommand(`git commit -m "${newVersion}"`)
	await runCommand(`git tag -a ${newVersion} -m "${newVersion}"`)
	console.log('Version bump flow complete.')
}

try {
	await main()
}
catch (error) {
	console.error(error instanceof Error ? error.message : error)
	throw error
}
