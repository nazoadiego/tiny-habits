# Tiny Habits

An Obsidian Plugin built with Svelte to track different habits. 

It works by simply marking a code block with the `habits` tag.

All the entries will be stored inside your notes frontmatter.

Support for habits that are skipped, failed and, of course, completed.

Also a streak system.

## How to use

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `pnpm i` to install dependencies.
- `pnpm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.


# Tests
![Tests](https://github.com/nazoadiego/tiny-habits/workflows/Tests/badge.svg)

Run with `pnpm run test`

# Linting
![Lint](https://github.com/nazoadiego/tiny-habits/workflows/Lint/badge.svg)

Run with `pnpm run lint`

## Making a release

Modify the version in package.json.

```
pnpm run version
git tag -a 0.2.0 -m "0.2.0"
git push origin 0.2.0
```

## Funding URL

You can include funding URLs where people who use your plugin can financially support it.

The simple way is to set the `fundingUrl` field to your link in your `manifest.json` file:

```json
{
    "fundingUrl": "https://buymeacoffee.com"
}
```

If you have multiple URLs, you can also do:

```json
{
    "fundingUrl": {
        "Buy Me a Coffee": "https://buymeacoffee.com",
        "GitHub Sponsor": "https://github.com/sponsors",
        "Patreon": "https://www.patreon.com/"
    }
}
```

## API Documentation

See https://github.com/obsidianmd/obsidian-api
