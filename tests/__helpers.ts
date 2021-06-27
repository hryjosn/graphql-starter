import { PrismaClient } from '@prisma/client'
import { ServerInfo } from 'apollo-server'
import { decodeBase64 } from 'bcryptjs'
import { execSync } from 'child_process'
import getPort, { makeRange } from 'get-port'
import { GraphQLClient } from 'graphql-request'
import { join } from 'path'
import { Database } from 'sqlite3'
import { prisma } from '../src/db'
import { server } from '../src/server'

type TestContext = {
  client: GraphQLClient
  db: PrismaClient
}
export function createTestContext(): TestContext {
  let ctx = {} as TestContext
  const graphqlCtx = graphqlTestContext()
  const prismaCtx = prismaTestContext()

  beforeEach(async () => {
    const client = await graphqlCtx.before()
    const db = await prismaCtx.before()

    Object.assign(ctx, {
      client,
      db,
    })
  })

  afterEach(async () => {
    await graphqlCtx.after()
    await prismaCtx.after()
  })
  afterAll(async () => {
    execSync(
      `rm ${join(__dirname, '..', 'prisma', process.env.DB_URL.split('/')[1])}`,
    )

    console.log('done')
  })

  return ctx
}

function graphqlTestContext() {
  let serverInstance: ServerInfo | null = null

  return {
    async before() {
      const port = await getPort({ port: makeRange(4000, 6000) })

      serverInstance = await server.listen({ port })
      // Close the Prisma Client connection when the Apollo Server is closed
      serverInstance.server.on('close', async () => {
        prisma.$disconnect()
      })

      return new GraphQLClient(`http://localhost:${port}`)
    },
    async after() {
      serverInstance?.server.close()
    },
  }
}

function prismaTestContext() {
  const prismaBinary = join(__dirname, '..', 'node_modules', '.bin', 'prisma')
  let prismaClient: null | PrismaClient = null

  return {
    async before() {
      // Run the migrations to ensure our schema has the required structure
      execSync(`${prismaBinary} db push`)

      // Construct a new Prisma Client connected to the generated schema
      prismaClient = new PrismaClient()

      return prismaClient
    },
    async after() {
      // Drop the schema after the tests have completed
      const client = new Database(':memory:')

      await client.close()

      // Release the Prisma Client connection
      await prismaClient?.$disconnect()
    },
  }
}
