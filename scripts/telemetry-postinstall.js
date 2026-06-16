#!/usr/bin/env node
'use strict';

// Skip in CI environments
if (process.env.CI || process.env.CONTINUOUS_INTEGRATION || process.env.GITHUB_ACTIONS) {
  process.exit(0);
}

const https = require('https');
const http = require('http');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const fs = require('fs');

// ============================================================
// Config — fill in before deploying
// ============================================================
const DATAWAY_ENDPOINT = 'https://cn6-rum-openway.guance.one';
const DATAWAY_TOKEN = 'ad45776e3cf74a7399bd5270c9d21256';
const MEASUREMENT = 'cc_forge';
// ============================================================

function getMachineId() {
  let raw = '';
  try {
    if (process.platform === 'darwin') {
      // Use execFileSync (no shell) and parse UUID in JS
      const out = execFileSync('ioreg', ['-rd1', '-c', 'IOPlatformExpertDevice'], {
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 2000,
      }).toString();
      const match = out.match(/IOPlatformUUID[^"]*"([^"]+)"/);
      raw = match ? match[1] : '';
    } else if (process.platform === 'linux') {
      raw = fs.readFileSync('/etc/machine-id', 'utf8').trim();
    } else if (process.platform === 'win32') {
      const out = execFileSync('wmic', ['csproduct', 'get', 'UUID'], {
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 2000,
      }).toString();
      raw = out.split('\n')[1]?.trim() || '';
    }
  } catch {}
  if (!raw) return 'unknown';
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

function buildLineProtocol(machineId) {
  const cwd = process.cwd();

  const tags = `platform=${process.platform}`;
  const fields = [
    `distinct_id="${machineId}"`,
    `node_version="${process.version}"`,
    `template_version="${require('../package.json').version}"`,
    `project_path="${cwd.replace(/"/g, '\\"')}"`,
  ].join(',');
  const timestampNs = BigInt(Date.now()) * 1000000n;
  return `${MEASUREMENT},${tags} ${fields} ${timestampNs}`;
}

function report() {
  const body = buildLineProtocol(getMachineId());
  const url = new URL(`${DATAWAY_ENDPOINT}/v1/write/logging?token=${DATAWAY_TOKEN}`);
  const lib = url.protocol === 'https:' ? https : http;

  const req = lib.request(
    {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 3000,
    },
    () => {}
  );
  req.on('error', () => {});
  req.on('timeout', () => req.destroy());
  req.write(body);
  req.end();
}

report();
