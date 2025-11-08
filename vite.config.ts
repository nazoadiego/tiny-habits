/// <reference types="vitest" />

import { configDefaults } from 'vitest/config'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import repl, { REPLServer } from 'node:repl'

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
			configureServer(viteServer) {
				// Create the REPL instance once
				let replServer: REPLServer | undefined = undefined

				// Middleware to preload models
				viteServer.middlewares.use('/load-models', async (request, res) => {
					try {
						const modelsDirectory = path.resolve(__dirname, 'models')
						const models = {}
						const files = fs.readdirSync(modelsDirectory).filter((file) =>
							file.endsWith('.ts')
						)

						for (const file of files) {
							const filePath = path.join(modelsDirectory, file)

							// Dynamically import the module using Vite's SSR runner
							const module = await viteServer.ssrLoadModule(filePath)
							const exportName = file.slice(0, -3) // Remove `.ts` extension

							models[exportName] = module.default || module // Use default export if available
						}

						// Initialize the REPL only once
						if (!replServer) {
							replServer = repl.start({
								prompt: '\u001B[34m>> \u001B[0m' // Blue prompt
							})
							console.log('REPL instance created.')

							const initializeReplContext = async () => {
								try {
									replServer.context.models = models // Assign models under a namespace
									console.log('Models loaded into REPL context. Access them via the "models" object.')
								}
								catch (error) {
									console.error('Failed to load models into REPL context:', error.message)
								}
							}
							await initializeReplContext()
						}

						res.writeHead(200, { 'Content-Type': 'application/json' })
						res.end(JSON.stringify({ success: true, models: Object.keys(models) })) // Send only the keys as metadata
					}
					catch (error) {
						console.error('Error loading models:', error)
						res.writeHead(500, { 'Content-Type': 'application/json' })
						res.end(JSON.stringify({ error: 'Failed to load models', details: error.message }))
					}
				})
			}
		}
	],
	resolve: {
		alias: {
			obsidian: path.resolve(__dirname, 'mock-obsidian')
		}
	}
})
