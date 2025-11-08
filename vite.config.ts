/// <reference types="vitest" />

import { configDefaults } from 'vitest/config'
import { Connect, defineConfig, type ViteDevServer } from 'vite'
import * as fs from 'node:fs'
import path from 'node:path'
import * as repl from 'node:repl'
import { fileURLToPath } from 'node:url'
import type { ServerResponse } from 'node:http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/*
	TODO: don't namespace models, do Object.assign
*/

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			provider: 'v8',
			enabled: true,
			exclude: [
				...configDefaults.exclude,
				'main.js',
				'version-bump.mjs',
				'**/*.config.*'
			]
		}
	},
	appType: 'custom', // Custom app type for middleware mode
	plugins: [
		{
			name: 'load-models-middleware',
			async configureServer(viteServer) {
				const models = await importModels(viteServer)
				startRepl({ models })
				viteServer.middlewares.use('/load-models', (request, response) =>  renderReplStatus(request, response, models))
			}
		}
	],
	resolve: {
		alias: {
			obsidian: path.resolve(__dirname, 'mock-obsidian')
		}
	}
})

const renderReplStatus = async (request: Connect.IncomingMessage, response: ServerResponse, models: Models) => {
	try {
		response.writeHead(200, { 'Content-Type': 'application/json' })
		response.end(JSON.stringify({ success: true, models: Object.keys(models), replStatus: true })) // Send only the keys as metadata
	}
	catch (error) {
		console.error('Error loading models:', error)
		response.writeHead(500, { 'Content-Type': 'application/json' })
		response.end(JSON.stringify({ error: 'Failed to load models', details: error.message }))
	}
}

type Models = { [key: string]: unknown; }

const importModels = async (viteServer: ViteDevServer) => {
	const modelsDirectory = path.resolve(__dirname, 'models')
	const models: Models = {}
	const files: string[] = fs.readdirSync(modelsDirectory).filter((file: string) => file.endsWith('.ts') )

	for (const file of files) {
		const filePath = path.join(modelsDirectory, file)

		// Dynamically import the module using Vite's SSR runner
		const module = await viteServer.ssrLoadModule(filePath)

		// Remove `.ts` extension
		const exportName = file.slice(0, -3)

		// Use default export if available
		models[exportName] = module.default || module
	}

	return models
}

const startRepl = ({ models }: { models: Models}) => {
	const replServer: repl.REPLServer | undefined = undefined
	if (!replServer) {
		const replServer: repl.REPLServer = repl.start({
			prompt: '\u001B[34m>> \u001B[0m' // Blue prompt
		})
		console.log('REPL instance created.')

		const initializeReplContext = () => {
			try {
				if (replServer == undefined) return

				replServer.context.models = models // Assign models under a namespace
				console.log('Models loaded into REPL context. Access them via the "models" object.')
			}
			catch (error) {
				console.error('Failed to load models into REPL context:', error.message)
			}
		}
		initializeReplContext()
	}
}
