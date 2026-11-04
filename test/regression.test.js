// Regression suite: real issues from the field (written with fictional brands) re-run on every test.
// Add cases with scripts/import-issues.mjs (from the dashboard's issues JSON export) or by hand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { buildKit } from '../src/kit.js';
import { buildLanding } from '../src/landing.js';
import { checkOutput, visibleText } from '../src/checks.js';

const dir = new URL('./regression/', import.meta.url);
const cases = readdirSync(dir).filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')));

for (const c of cases) {
  test(`regression: ${c.name}`, () => {
    const out = c.tool === 'kit' ? buildKit(c.args) : { html: buildLanding(c.args) };
    const checks = checkOutput({ kind: c.tool === 'kit' ? 'kit' : 'page', html: out.html, args: c.args, posts: out.posts ?? [], contentOnly: out.contentOnly });
    assert.ok(checks.passed, JSON.stringify(checks.issues));
    const text = `${out.html} ${(out.posts ?? []).flatMap((p) => [p.hook, ...Object.values(p.caption ?? {})]).join(' ')}`;
    const visible = `${visibleText(out.html)} ${(out.posts ?? []).flatMap((p) => [p.hook, ...Object.values(p.caption ?? {})]).join(' ')}`;
    for (const s of c.mustInclude ?? []) assert.ok(text.toLowerCase().includes(s.toLowerCase()), `missing: ${s}`);
    for (const s of c.mustNotInclude ?? []) assert.ok(!visible.toLowerCase().includes(s.toLowerCase()), `must not include: ${s}`);
  });
}
