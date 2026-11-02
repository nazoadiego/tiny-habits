import { readFile, writeFile } from 'node:fs/promises'
import { prepareReleaseData, resolveVersion, VERSION_FILES } from './release-library.mjs'

const files = await Promise.all(
	VERSION_FILES.map(async name => [
		name,
		JSON.parse(await readFile(new URL(`../${name}`, import.meta.url), 'utf8'))
	])
)
const data = Object.fromEntries(files)
const requestedVersion = process.argv[2]
if (!requestedVersion) {
	throw new Error('Usage: pnpm version:new <major|minor|patch|major.minor.patch>')
}
const version = resolveVersion(data['package.json'].version, requestedVersion)
prepareReleaseData(data, version)

await Promise.all(files.map(([name]) =>
	writeFile(new URL(`../${name}`, import.meta.url), `${JSON.stringify(data[name], undefined, '\t')}\n`)
))
console.log(`Prepared ${version}.`)
