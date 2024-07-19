import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkIdExists } from '../middlewares/check-session-id-exists'

// Pluggin que irá conter todas as rotas de transação da minha aplicação
export async function transactionsRoutes(app: FastifyInstance) {
  // Rota '/' com o método GET retornando uma função para listar todas as transações
  app.get('/', { preHandler: [checkIdExists] }, async (request) => {
    // Pegando o SessionId dos cookies
    const { sessionId } = request.cookies

    // Pegando todas as transações no Banco de Dados
    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select()

    // Retornando as transações
    return { transactions }
  })

  // Rota '/' com o método GET retornando uma função para listar apenas a transação com o id informado pelo usuário
  app.get('/:id', { preHandler: [checkIdExists] }, async (request) => {
    // Criando a estrutura dos dados para serem pegos no request.params
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    // Pegando id do request.params com uma verificação de tipos com a biblioteca zod
    const { id } = getTransactionParamsSchema.parse(request.params)

    // Pegando o SessionId dos cookies
    const { sessionId } = request.cookies

    // Pegando a transação com o id informado pelo usuário
    const transaction = await knex('transactions')
      .where({
        session_id: sessionId,
        id,
      })
      .first()

    // Retornado essa transação
    return { transaction }
  })

  // Rota '/summary' com o método GET retornando uma função para informar a soma total da coluna amount
  app.get('/summary', { preHandler: [checkIdExists] }, async (request) => {
    // Pegando o SessionId dos cookies
    const { sessionId } = request.cookies

    // Somando todos os dados da coluna amount do tabela transactions
    const summary = await knex('transactions')
      .where({ session_id: sessionId })
      .sum('amount', { as: 'amount' })
      .first()

    // retornando a soma total
    return { summary }
  })

  // Rota '/' com o método http POST retornando uma função para criar uma nova transação
  app.post('/', async (request, reply) => {
    // Criando a estrutura dos dados para serem pegos no request.body
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    // Pegando title, amount e type do request.body com uma verificação de tipos com a biblioteca zod
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    // Pega o código da sessão dos cookies da requisição
    let sessionId = request.cookies.sessionId

    // Se não tem nenhum cookie na requisição, cria um sessioId e passa para a Reply com alguns parâmetros
    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    // Inserindo os dados pegos no request.body no banco de dados
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    // Retornando o HTTP code 201 (Created)
    return reply.status(201).send()
  })
}
