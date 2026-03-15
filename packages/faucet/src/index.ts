import { serve } from '@hono/node-server'
import { createApp } from './routes.js'

const port = parseInt(process.env.PORT || '3000', 10)
const app = createApp()

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Claw Domains Faucet running on http://localhost:${info.port}`)
})
