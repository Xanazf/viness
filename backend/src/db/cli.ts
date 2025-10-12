import { connectDatabase } from './index'
import { migrate } from './migrate'

const force = process.env.FORCE === 'true'
const alter = process.env.ALTER === 'true'

async function main() {
  await connectDatabase()
  await migrate({ force, alter })
  console.log('Migration complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
