// Importando o arquivo .env
import 'dotenv/config'

// Importando a biblioteca do Zod
import { z } from 'zod'

// Variáveis de Ambiente para ser verificadas com seus devidos tipos
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

// Constante para verificação das variáveis de ambiente
const _env = envSchema.safeParse(process.env)

// Se alguma variável de ambiente estiver faltando ou incorreta, retornar um erro
if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error.format())
  throw new Error('Invalid environment variables!')
}

// Se passou sem nenhum erro, expõe as Variáveis de Ambiente para o projeto
export const env = _env.data
