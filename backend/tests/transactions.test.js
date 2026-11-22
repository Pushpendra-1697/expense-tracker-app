const request = require('supertest');
const app = require('../src/app');

const register = async (overrides = {}) => {
  const payload = {
    name: 'User A',
    email: `usera_${Date.now()}@example.com`,
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { token: res.body.token, user: res.body.user };
};

const getDefaultAccount = async (token) => {
  const res = await request(app)
    .get('/api/accounts')
    .set('Authorization', `Bearer ${token}`);
  return res.body.data[0];
};

describe('Transaction CRUD & isolation', () => {
  it('creates, lists, updates, and deletes a transaction', async () => {
    const { token } = await register();
    const account = await getDefaultAccount(token);

    const create = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 50,
        type: 'expense',
        category: 'Food',
        account: account._id,
        note: 'Lunch',
      });

    expect(create.statusCode).toBe(201);
    expect(create.body.data.amount).toBe(50);
    const txId = create.body.data._id;

    const list = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);
    expect(list.statusCode).toBe(200);
    expect(list.body.data.length).toBe(1);
    expect(list.body.pagination.total).toBe(1);

    const update = await request(app)
      .put(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 75, note: 'Dinner' });
    expect(update.statusCode).toBe(200);
    expect(update.body.data.amount).toBe(75);

    const del = await request(app)
      .delete(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.statusCode).toBe(200);
  });

  it('prevents user B from accessing user A transactions', async () => {
    const userA = await register({ email: `a_${Date.now()}@ex.com`, name: 'A' });
    const userB = await register({ email: `b_${Date.now()}@ex.com`, name: 'B' });
    const accountA = await getDefaultAccount(userA.token);

    const created = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        amount: 100,
        type: 'income',
        category: 'Salary',
        account: accountA._id,
        note: 'Secret',
      });

    const txId = created.body.data._id;

    const getByB = await request(app)
      .get(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${userB.token}`);
    expect(getByB.statusCode).toBe(404);

    const updateByB = await request(app)
      .put(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ amount: 1 });
    expect(updateByB.statusCode).toBe(404);

    const deleteByB = await request(app)
      .delete(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${userB.token}`);
    expect(deleteByB.statusCode).toBe(404);

    const listB = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userB.token}`);
    expect(listB.body.data.length).toBe(0);
  });

  it('rejects unauthenticated transaction access', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.statusCode).toBe(401);
  });
});
