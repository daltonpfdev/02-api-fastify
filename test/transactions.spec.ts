import { test, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Transactions Routes', () => {
  // Antes de iniciar os testes, verifique o servidor está pronto para executalos
  beforeAll(async () => {
    await app.ready()
  })

  // Depois de executar os testes, fechar o servidor
  afterAll(async () => {
    await app.close()
  })

  // Apaga todo o conteudo do banco e cria de novo
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  // Criação do teste que simula uma criação de uma transação
  test('User can create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  // Criação do teste que simula uma criação de uma transação para poder listar as transações
  test('User can list all transacions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    ])
  })

  test('User can list a specifc transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionsWithIdResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionsWithIdResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    )
  })

  // Criação do teste que simula uma criação duas criações de transações para criação do sumário
  test('User can get the Summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit Transaction',
        amount: 3000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit Transaction',
        amount: 5000,
        type: 'debit',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: -2000,
    })
  })
})
