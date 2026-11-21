'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { checkContainerOwnership, buildComposeCommand, waitForServices, getStartupUrls } = require('./start');

const selection = { profiles: [], services: ['backend'] };

test('startup builds images by default and honors --no-build', () => {
  assert.ok(buildComposeCommand(selection, 'up', {})[1].includes('--build'));
  assert.ok(!buildComposeCommand(selection, 'up', { noBuild: true })[1].includes('--build'));
});
const config = {
  name: 'jetadmin',
  services: {
    backend: { container_name: 'jet-admin-backend', depends_on: { redis: {} } },
    redis: { container_name: 'jet-admin-redis' },
    unrelated: { container_name: 'unrelated' },
  },
};

function fakeDocker(containers, inspected = []) {
  return (cmd, args) => {
    assert.equal(cmd, 'docker');
    if (args.includes('config')) return { status: 0, stdout: JSON.stringify(config) };
    const name = args[2];
    inspected.push(name);
    if (!containers[name]) return { status: 1, stderr: `Error: No such container: ${name}` };
    return { status: 0, stdout: JSON.stringify([containers[name]]) };
  };
}

function owned(service, project = 'jetadmin') {
  return {
    Config: { Labels: {
      'com.docker.compose.project': project,
      'com.docker.compose.service': service,
    } },
    State: { Status: 'exited' },
  };
}

test('allows fresh installations and inspects dependencies, not unrelated services', () => {
  const inspected = [];
  checkContainerOwnership(selection, fakeDocker({}, inspected));
  assert.deepEqual(inspected, ['jet-admin-backend', 'jet-admin-redis']);
});

test('allows containers owned by the same Compose project and service', () => {
  checkContainerOwnership(selection, fakeDocker({
    'jet-admin-backend': owned('backend'),
    'jet-admin-redis': owned('redis'),
  }));
});

test('reports standalone container conflicts without changing anything', () => {
  assert.throws(() => checkContainerOwnership(selection, fakeDocker({
    'jet-admin-redis': { Config: { Labels: {} }, State: { Status: 'exited' } },
  })), /jet-admin-redis: standalone.*status exited/);
});

test('reports foreign Compose projects', () => {
  assert.throws(() => checkContainerOwnership(selection, fakeDocker({
    'jet-admin-redis': owned('redis', 'jet-admin'),
  })), /jet-admin-redis: jet-admin/);
});

test('rejects a name owned by a different service in the same project', () => {
  assert.throws(() => checkContainerOwnership(selection, fakeDocker({
    'jet-admin-redis': owned('other-service'),
  })), /Container names are already occupied/);
});

test('fails safely when Docker inspection fails for reasons other than a missing container', () => {
  const docker = fakeDocker({});
  assert.throws(() => checkContainerOwnership(selection, (cmd, args, opts) => {
    if (args[0] === 'container') return { status: 1, stderr: 'connection refused' };
    return docker(cmd, args, opts);
  }), /check Docker connectivity/);
});

function readiness(rows) {
  return () => ({ status: 0, stdout: rows.map((row) => JSON.stringify(row)).join('\n') });
}

test('readiness detects restart loops rather than reporting startup success', () => {
  assert.throws(() => waitForServices(selection, readiness([
    { Service: 'backend', State: 'restarting', Health: 'starting' },
  ])), /backend is restarting/);
});

test('readiness waits for health checks, not just a running process', () => {
  let calls = 0;
  waitForServices(selection, () => readiness([
    { Service: 'backend', State: 'running', Health: ++calls === 1 ? 'starting' : 'healthy' },
  ])(), () => {});
  assert.equal(calls, 2);
});

test('readiness accepts successfully completed storage initialization', () => {
  waitForServices({ profiles: ['storage'], services: ['storage-init', 'rustfs'] }, readiness([
    { Service: 'storage-init', State: 'exited', ExitCode: 0 },
    { Service: 'rustfs', State: 'running', Health: 'healthy' },
  ]));
});

test('readiness rejects failed storage initialization', () => {
  assert.throws(() => waitForServices({ profiles: [], services: ['storage-init'] }, readiness([
    { Service: 'storage-init', State: 'exited', ExitCode: 1 },
  ])), /storage-init is exited/);
});

test('missing or unhealthy services cannot produce a success result', () => {
  for (const rows of [[], [{ Service: 'backend', State: 'running', Health: 'unhealthy' }]]) {
    let clock = 0;
    assert.throws(() => waitForServices(selection, readiness(rows), () => { clock += 300000; }, () => clock),
      /did not become ready.*backend/);
  }
});

test('core startup only advertises the selected web app and API', () => {
  assert.deepEqual(getStartupUrls({ apps: ['frontend', 'backend'], mode: 'docker', services: ['frontend', 'backend'] }), [
    'Web app: http://localhost', 'API: http://localhost:8090',
  ]);
});
