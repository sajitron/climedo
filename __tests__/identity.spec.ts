import 'reflect-metadata';
import HTTPStatus from 'http-status-codes';
import supertest from 'supertest';
import App from '../src/server/app';
import DB from '../src/server/db';
import { DAILY_FAILED_LOGIN_TRIES } from '../src/server/services';
import { mockIdentityRequest } from './mocks';
import {
  InvalidPasswordError,
  LockedOutError
} from '../src/server/controllers/base';

const BASE_URL = '/api/v1/climedo/identity';
const ADMIN_URL = '/api/v1/climedo/admin';

let app: App;
let request: supertest.SuperTest<supertest.Test>;

beforeAll(async () => {
  await DB.connect();
  await DB.connection.dropDatabase();

  app = new App();
  request = supertest(app.build());
});

afterAll(async () => {
  await DB.connection.dropDatabase();
  await DB.disconnect();
});

describe('identity creation', () => {
  it('creates a new user identity', async () => {
    const payload = mockIdentityRequest('user');

    const { body } = await request
      .post(BASE_URL)
      .send(payload)
      .expect(HTTPStatus.OK);

    const { data, status } = body;

    expect(status).toBe('success');
    expect(data.identity.first_name).toBe(payload.first_name);
    expect(data.identity.last_name).toBe(payload.last_name);
    expect(data.identity.email).toBe(payload.email);
    expect(data.identity.role).toBe('user');
    expect(data.token).toBeDefined();
  });

  it('creates a new admin identity', async () => {
    const payload = mockIdentityRequest('admin');

    const { body } = await request
      .post(BASE_URL)
      .send(payload)
      .expect(HTTPStatus.OK);

    const { data, status } = body;

    expect(status).toBe('success');
    expect(data.identity.first_name).toBe(payload.first_name);
    expect(data.identity.last_name).toBe(payload.last_name);
    expect(data.identity.email).toBe(payload.email);
    expect(data.identity.role).toBe('admin');
    expect(data.token).toBeDefined();
  });

  it('sanitises a gmail address with special characters while creating a user identity', async () => {
    const payload = mockIdentityRequest('user');

    const { body } = await request
      .post(BASE_URL)
      .send({ ...payload, email: 'h_an.solo@gmail.com' })
      .expect(HTTPStatus.OK);

    const { data, status } = body;

    expect(status).toBe('success');
    expect(data.identity.email).toBe('hansolo@gmail.com');
  });

  it('does not create a identity if all required fields are not present', async () => {
    const payload = mockIdentityRequest('user');

    const { body } = await request
      .post(BASE_URL)
      .send({ ...payload, email: null })
      .expect(HTTPStatus.UNPROCESSABLE_ENTITY);

    const { status } = body;

    expect(status).toBe('error');
  });
});

describe('identity login', () => {
  it('should login a user identity with the right credentials', async () => {
    const payload = mockIdentityRequest('user');

    await request.post(BASE_URL).send(payload).expect(HTTPStatus.OK);

    const { body: response } = await request
      .post(`${BASE_URL}/login`)
      .send({
        email: payload.email,
        password: payload.password
      })
      .expect(HTTPStatus.OK);

    const { data, status } = response;

    expect(status).toBe('success');
    expect(data.identity.role).toBe('user');
    expect(data.token).toBeDefined();
  });

  it('should not login a user identity with invalid credentials', async () => {
    const payload = mockIdentityRequest('user');

    await request.post(BASE_URL).send(payload).expect(HTTPStatus.OK);

    const { body: response } = await request
      .post(`${BASE_URL}/login`)
      .send({
        email: payload.email,
        password: 'randompass'
      })
      .expect(HTTPStatus.BAD_REQUEST);

    const { status } = response;

    expect(status).toBe('error');
  });

  it('should block an identity after five failed login attempts', async () => {
    const payload = mockIdentityRequest('user');

    await request.post(BASE_URL).send(payload).expect(HTTPStatus.OK);

    for (let tries = 1; tries <= 5; tries++) {
      const { body } = await request
        .post(`${BASE_URL}/login`)
        .send({
          email: payload.email,
          password: 'randomised'
        })
        .expect(HTTPStatus.BAD_REQUEST);

      const remainingTries = DAILY_FAILED_LOGIN_TRIES - tries;

      expect(body.status).toBe('error');
      expect(body.message).toBe(
        tries < 5
          ? new InvalidPasswordError(remainingTries).message
          : new LockedOutError().message
      );
    }
  });
});

describe('update identity', () => {
  it("should update an identity's info", async () => {
    const payload = mockIdentityRequest('user');

    const email = 'leiaskywalker@ymail.com';

    const { body } = await request
      .post(BASE_URL)
      .send(payload)
      .expect(HTTPStatus.OK);

    const { body: response } = await request
      .put(`${BASE_URL}/${body.data.identity._id}`)
      .set('Authorization', `Bearer ${body.data.token}`)
      .send({ email })
      .expect(HTTPStatus.OK);

    const { data, status } = response;

    expect(status).toBe('success');
    expect(data.email).toBe(email);
  });

  it("does not allow an identity update another identity's details", async () => {
    const payload1 = mockIdentityRequest('user');
    const payload2 = mockIdentityRequest('user');

    const email = 'jojorabbit@ymail.com';

    const { body: identity1 } = await request
      .post(BASE_URL)
      .send(payload1)
      .expect(HTTPStatus.OK);

    const { body: identity2 } = await request
      .post(BASE_URL)
      .send(payload2)
      .expect(HTTPStatus.OK);

    const { body: response } = await request
      .put(`${BASE_URL}/${identity1.data.identity._id}`)
      .set('Authorization', `Bearer ${identity2.data.token}`)
      .send({ email })
      .expect(HTTPStatus.BAD_REQUEST);

    const { status, message } = response;

    expect(status).toBe('error');
    expect(message).toMatch(/Only personal details can be updated/);
  });

  it("allows an admin update another identity's details", async () => {
    const payload1 = mockIdentityRequest('user');
    const payload2 = mockIdentityRequest('admin');

    const email = 'peterpan@ymail.com';

    const { body: identity1 } = await request
      .post(BASE_URL)
      .send(payload1)
      .expect(HTTPStatus.OK);

    const { body: identity2 } = await request
      .post(BASE_URL)
      .send(payload2)
      .expect(HTTPStatus.OK);

    const { body: response } = await request
      .put(`${ADMIN_URL}/${identity1.data.identity._id}`)
      .set('Authorization', `Bearer ${identity2.data.token}`)
      .send({ email })
      .expect(HTTPStatus.OK);

    const { status, data } = response;

    expect(status).toBe('success');
    expect(data.email).toBe(email);
  });
});
