import { access, readFile, stat } from 'node:fs/promises'
import { constants } from 'node:fs'
import { validateReleaseData, VERSION_FILES } from './release-library.mjs'

const version = process.argv[2] ?? process.env.RELEASE_TAG
if (!version) throw new Error('Usage: node scripts/verify-release.mjs <major.minor.patch> [--skip-assets]')

const entries = await Promise.all(VERSION_FILES.map(async name => [
	name,
	JSON.parse(await readFile(new URL(`../${name}`, import.meta.url), 'utf8'))
]))
validateReleaseData(Object.fromEntries(entries), version)

if (!process.argv.includes('--skip-assets')) {
	for (const name of ['main.js', 'manifest.json']) {
		const url = new URL(`../${name}`, import.meta.url)
		await access(url, constants.R_OK)
		const { size } = await stat(url)
		if (size === 0) throw new Error(`${name} is empty`)
	}
}

console.log(`Release ${version} is valid.`)
