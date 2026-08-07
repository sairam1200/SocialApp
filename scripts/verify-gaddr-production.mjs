#!/usr/bin/env node

const expected = {
	searchMeFrontend: '98a50ce20a4a06a1646011110c4b7cc3a8d63118',
	searchMeBackendRevision: 'gaddr-search-me-backend-00049-5p4',
	jobs: 'b5b75a74dd418b1cc0126be8977493617f2dca7d',
}

const checks = [
	{
		name: 'Gaddr root',
		url: 'https://gaddr.com',
		expect: () => true,
	},
	{
		name: 'Gaddr Search & Me web',
		url: 'https://demo.gaddr.com/api/version',
		expect: (body) => body.commit === expected.searchMeFrontend,
	},
	{
		name: 'Gaddr Search & Me API',
		url: 'https://demo.gaddr.com/api/v1/version',
		expect: (body) => body.revision === expected.searchMeBackendRevision,
	},
	{
		name: 'Gaddr Jobs',
		url: 'https://jobs.gaddr.com/api/integration/health',
		expect: (body) => body.status === 'ok',
	},
	{
		name: 'Gaddr Pay',
		url: 'https://pay.gaddr.com',
		expect: () => true,
	},
]

async function probe(check) {
	try {
		const response = await fetch(check.url, {
			redirect: 'follow',
			signal: AbortSignal.timeout(12_000),
		})
		const text = await response.text()
		let body = null
		try {
			body = JSON.parse(text)
		} catch {
			// A public page is allowed to be HTML. Version and health endpoints are not.
		}
		const passed = response.ok && check.expect(body)
		return {
			name: check.name,
			status: passed ? 'PASS' : 'FAIL',
			detail: response.ok ? JSON.stringify(body ?? { http: response.status }) : `HTTP ${response.status}`,
		}
	} catch (error) {
		const cause =
			error instanceof Error && error.cause instanceof Error
				? `: ${error.cause.message}`
				: ''
		return {
			name: check.name,
			status: 'FAIL',
			detail: error instanceof Error ? `${error.message}${cause}` : String(error),
		}
	}
}

const results = await Promise.all(checks.map(probe))
console.table(results)

if (process.argv.includes('--strict') && results.some((result) => result.status !== 'PASS')) {
	process.exitCode = 1
}
