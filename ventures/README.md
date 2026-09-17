# Ventures

One folder per product. Each venture is an npm workspace with its own framework
(WXT for browser extensions, the Figma plugin toolchain, Astro/Hono for web) and a
`venture.json` validated by `@foundry/core`'s `defineVenture`.

Lifecycle: `idea → validated → building → launched → earning | killed`. A venture
only moves to `validated` with written demand evidence in its `RESEARCH.md`.
