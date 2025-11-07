import repl from 'node:repl'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// Dynamically import the TypeScript file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dateValuePath = path.join(__dirname, 'models/DateValue.ts')

const loadDateValue = async () => {
	const module = await import(dateValuePath)
	return module.default || module
}

const DateValue = await loadDateValue()

const replServer = repl.start({
	prompt: '\u001B[34m>> \u001B[0m' // Blue prompt
})

replServer.context.DateValue = DateValue
