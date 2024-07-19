import fastify from 'fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'
import cookie from '@fastify/cookie'

// Instanciando nosso app com a função do fastify
const app = fastify()

// Importando o pluggin com as configurações de cookies da biblioteca '@fastify/cookie'
app.register(cookie)

// Importando o pluggin com as rotas da minha aplicação
app.register(transactionsRoutes, {
  prefix: 'transactions',
})

// App ouvindo a porta 3333
app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running')
  })
