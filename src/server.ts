import { ApolloServer } from 'apollo-server-koa'
import { createContext } from './context'
import { schema } from './schema'
import { graphqlUploadKoa } from 'graphql-upload'
import Koa from 'koa'
import cors from '@koa/cors'
import koaRouter from 'koa-router'
import koaPlayground from 'graphql-playground-middleware-koa'
import koaBody from 'koa-bodyparser'

const router = new koaRouter()
router.all('/playground', koaPlayground({ endpoint: '/graphql' }))

export const app = new Koa().use(
  graphqlUploadKoa({
    // Limits here should be stricter than config for surrounding
    // infrastructure such as Nginx so errors can be handled elegantly by
    // `graphql-upload`:
    // https://github.com/jaydenseric/graphql-upload#type-processrequestoptions
    maxFileSize: 10000000, // 10 MB
    maxFiles: 20,
  }),
)
app.use(
  cors({
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Date'],
    maxAge: 100,
    credentials: true,
    allowMethods: ['GET', 'POST'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Custom-Header',
      'anonymous',
    ],
  }),
)
app.use(koaBody())

app.use(router.routes())
app.use(router.allowedMethods())
export const server = new ApolloServer({
  // Disable the built in file upload implementation that uses an outdated
  // `graphql-upload` version, see:
  // https://github.com/apollographql/apollo-server/issues/3508#issuecomment-662371289
  uploads: false,
  schema,
  context: createContext,
})
server.applyMiddleware({ app, path: '/' })
