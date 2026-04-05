/**
 * Fetch Slack activity from student channels and write to public/slack-data.json
 *
 * Required env vars:
 *   SLACK_BOT_TOKEN  — Bot User OAuth Token (xoxb-...)
 *
 * Required bot scopes:
 *   channels:read      — list public channels
 *   channels:history   — read messages in public channels
 *   users:read         — look up user display names
 *   users:read.email   — (optional) match by email
 *
 * Channel naming convention: #client-*, #vip-client-*, #vvip-client-*
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://slack.com/api';
const TOKEN = process.env.SLACK_BOT_TOKEN;

if (!TOKEN) {
  console.error('Missing SLACK_BOT_TOKEN environment variable.');
  process.exit(1);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function slack(method, params = {}) {
  const url = new URL(`${BASE}/${method}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack API error on ${method}: ${data.error}`);
  return data;
}

async function paginateAll(method, listKey, params = {}) {
  const results = [];
  let cursor;
  do {
    const data = await slack(method, { ...params, ...(cursor ? { cursor } : {}), limit: 200 });
    results.push(...(data[listKey] || []));
    cursor = data.response_metadata?.next_cursor;
  } while (cursor);
  return results;
}

function daysAgo(n) {
  return Math.floor((Date.now() - n * 24 * 60 * 60 * 1000) / 1000);
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching Slack activity...');

  // 1. List all public channels, filter to student channels
  console.log('  → Listing channels...');
  const allChannels = await paginateAll('conversations.list', 'channels', {
    types: 'public_channel',
    exclude_archived: true,
  });

  const CHANNEL_PREFIXES = ['client-', 'vip-client-', 'vvip-client-'];
  const YEAR_SUFFIXES = ['-25-26', '-26-27', '-2025-2026', '-2026-2027'];

  const studentChannels = allChannels.filter((ch) => {
    const name = ch.name.toLowerCase();
    const hasPrefix = CHANNEL_PREFIXES.some((p) => name.startsWith(p));
    const hasSuffix = YEAR_SUFFIXES.some((s) => name.endsWith(s));
    return hasPrefix && hasSuffix;
  });

  console.log(`  → Found ${studentChannels.length} student channels.`);

  // 2. Build user activity map across all channels
  const since7d = daysAgo(7);
  const since30d = daysAgo(30);

  // userId → activity data
  const userActivity = {};

  for (let i = 0; i < studentChannels.length; i++) {
    const ch = studentChannels[i];
    if (i % 50 === 0) console.log(`  → Processing channel ${i + 1}/${studentChannels.length}...`);

    let messages = [];
    try {
      const data = await slack('conversations.history', {
        channel: ch.id,
        oldest: since30d,
        limit: 200,
      });
      messages = data.messages || [];
    } catch {
      // Bot not in channel or other error — skip
      continue;
    }

    // Track which users are active in this channel
    const channelUsers = new Set();
    for (const msg of messages) {
      if (!msg.user || msg.subtype) continue;
      channelUsers.add(msg.user);

      if (!userActivity[msg.user]) {
        userActivity[msg.user] = {
          channels: new Set(),
          messagesLast7Days: 0,
          messagesLast30Days: 0,
          lastActive: null,
        };
      }
      const ua = userActivity[msg.user];
      ua.channels.add(ch.name);
      ua.messagesLast30Days++;
      const ts = parseFloat(msg.ts);
      if (ts >= since7d) ua.messagesLast7Days++;
      if (!ua.lastActive || ts > ua.lastActive) ua.lastActive = ts;
    }
  }

  console.log(`  → Collected activity for ${Object.keys(userActivity).length} users.`);

  // 3. Resolve user IDs → names
  console.log('  → Resolving user names...');
  const strategistsOutput = {};

  for (const [userId, activity] of Object.entries(userActivity)) {
    let displayName = userId;
    let realName = userId;
    let email = null;

    try {
      const data = await slack('users.info', { user: userId });
      const profile = data.user?.profile || {};
      displayName = profile.display_name || profile.real_name || userId;
      realName = profile.real_name || displayName;
      email = profile.email || null;
    } catch {
      // skip
    }

    strategistsOutput[userId] = {
      userId,
      displayName,
      realName,
      email,
      channelCount: activity.channels.size,
      messagesLast7Days: activity.messagesLast7Days,
      messagesLast30Days: activity.messagesLast30Days,
      lastActive: activity.lastActive
        ? new Date(activity.lastActive * 1000).toISOString()
        : null,
      channels: Array.from(activity.channels).sort(),
    };
  }

  // 4. Write output
  const output = {
    lastUpdated: new Date().toISOString(),
    channelsScanned: studentChannels.length,
    strategists: strategistsOutput,
  };

  const outPath = resolve(__dirname, '../public/slack-data.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Wrote ${Object.keys(strategistsOutput).length} strategist records to public/slack-data.json`);
  console.log(`  Scanned ${studentChannels.length} student channels.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
