import { server } from './server'

server.listen().then(({ url }) =>
  console.log(`\
🚀 Server ready at: ${url}
⭐️ See sample queries: http://pris.ly/e/ts/graphql-auth#using-the-graphql-api`),
)
