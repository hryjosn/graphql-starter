import { permissions } from './permissions'
import { applyMiddleware } from 'graphql-middleware'
import { makeSchema, asNexusMethod } from 'nexus'
import { DateTimeResolver } from 'graphql-scalars'
import * as types from './graphql'
export const DateTime = asNexusMethod(DateTimeResolver, 'date')

const schemaWithoutPermissions = makeSchema({
  types,
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/../nexus-typegen.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})

export const schema = applyMiddleware(schemaWithoutPermissions, permissions)
