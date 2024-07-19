import { app } from './app'
import { env } from './env'

// App ouvindo a porta 3333
app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running')
  })
