export const VERSION_FILES = ['package.json', 'manifest.json', 'versions.json']

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

export function assertVersion(version) {
	if (!VERSION_PATTERN.test(version ?? '')) {
		throw new Error(`Invalid version "${version ?? ''}"; expected major.minor.patch`)
	}
	return version
}

export function resolveVersion(currentVersion, requestedVersion) {
	assertVersion(currentVersion)
	if (['major', 'minor', 'patch'].includes(requestedVersion)) {
		const parts = currentVersion.split('.').map(Number)
		const index = { major: 0, minor: 1, patch: 2 }[requestedVersion]
		parts[index] += 1
		for (let cursor = index + 1; cursor < parts.length; cursor += 1) parts[cursor] = 0
		return parts.join('.')
	}
	return assertVersion(requestedVersion)
}

export function prepareReleaseData(data, version) {
	assertVersion(version)
	const packageVersion = data['package.json'].version
	const manifestVersion = data['manifest.json'].version
	if (packageVersion !== manifestVersion) {
		throw new Error('package.json and manifest.json versions differ')
	}

	const expectedMinAppVersion = data['manifest.json'].minAppVersion
	const existingMinAppVersion = data['versions.json'][version]
	if (existingMinAppVersion && existingMinAppVersion !== expectedMinAppVersion) {
		throw new Error(
			`${version} already maps to Obsidian ${existingMinAppVersion}; expected ${expectedMinAppVersion}`
		)
	}

	data['package.json'].version = version
	data['manifest.json'].version = version
	data['versions.json'][version] = expectedMinAppVersion
	return data
}

export function validateReleaseData(data, version) {
	assertVersion(version)
	const problems = []
	if (data['package.json'].version !== version) problems.push('package.json version')
	if (data['manifest.json'].version !== version) problems.push('manifest.json version')
	if (data['versions.json'][version] !== data['manifest.json'].minAppVersion) {
		problems.push('versions.json minimum Obsidian version')
	}
	if (problems.length > 0) throw new Error(`Release ${version} disagrees with ${problems.join(', ')}`)
}
