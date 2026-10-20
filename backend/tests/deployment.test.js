import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../app.js';
import connectDB from '../config/db.js';

test('health, authentication and disabled email work without a database connection', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(`${base}/api/health`)).status, 200);
    assert.equal((await fetch(`${base}/api/users/profile`)).status, 401);
    const response = await fetch(`${base}/api/support/send`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    assert.equal(response.status, 503);
    assert.match((await response.json()).message, /disabled/);
    const aiResponse = await fetch(`${base}/api/ai/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Suggest a beginner strength workout' }),
    });
    assert.equal(aiResponse.status, 503);
    assert.match((await aiResponse.json()).reply, /unavailable/);
    assert.equal((await fetch(`${base}/api/does-not-exist`)).status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('Render serves a React deep link while unknown API routes stay JSON errors', async () => {
  process.env.SERVE_FRONTEND = 'true';
  const { default: staticApp } = await import('../app.js?static-preview');
  delete process.env.SERVE_FRONTEND;
  const server = staticApp.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(`${base}/dashboard`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /text\/html/);
    assert.equal((await fetch(`${base}/api/does-not-exist`)).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('missing database configuration rejects without terminating the server process', async () => {
  const previous = process.env.MONGO_URI;
  delete process.env.MONGO_URI;
  try { await assert.rejects(connectDB(), /MONGO_URI/); }
  finally { if (previous !== undefined) process.env.MONGO_URI = previous; }
});
