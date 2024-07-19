// Importando o knex
import { knex as setupKnex, Knex } from 'knex'

// Importando a constante com as variáveis de ambiente já validadas
import { env } from './env'

// Configuração para conexão com o banco de dados
export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'sqlite'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

// Criando uma constante para conexão com o banco de dados Sqlite3
export const knex = setupKnex(config)
