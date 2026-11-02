import { describe, expect, it } from 'vitest'
import { prepareReleaseData, resolveVersion, validateReleaseData } from './release-library.mjs'

function releaseData(version = '1.1.1') {
	return {
		'package.json': { version },
		'manifest.json': { version, minAppVersion: '0.15.0' },
		'versions.json': { [version]: '0.15.0' }
	}
}

describe('release-lib', () => {
	it('resolves semantic version bumps', () => {
		expect(resolveVersion('1.2.3', 'patch')).toBe('1.2.4')
		expect(resolveVersion('1.2.3', 'minor')).toBe('1.3.0')
		expect(resolveVersion('1.2.3', 'major')).toBe('2.0.0')
		expect(resolveVersion('1.2.3', '3.4.5')).toBe('3.4.5')
	})

	it('rejects invalid versions', () => {
		expect(() => resolveVersion('1.2.3', 'v1.2.3')).toThrow(/Invalid version/)
	})

	it('is safe to prepare the same release twice', () => {
		const data = releaseData()
		prepareReleaseData(data, '1.1.1')
		prepareReleaseData(data, '1.1.1')
		expect(() => validateReleaseData(data, '1.1.1')).not.toThrow()
	})

	it('rejects a conflicting versions.json entry', () => {
		const data = releaseData()
		data['versions.json']['1.2.0'] = '0.14.0'
		expect(() => prepareReleaseData(data, '1.2.0')).toThrow(/already maps/)
	})

	it('reports inconsistent release metadata', () => {
		const data = releaseData()
		data['manifest.json'].version = '1.1.0'
		expect(() => validateReleaseData(data, '1.1.1')).toThrow(/manifest.json version/)
	})
})
