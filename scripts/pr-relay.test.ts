import { describe, expect, it } from 'vitest';
import { parsePrRequest } from './pr-relay.ts';

const read = (p: string): string | null =>
  ({ 'docs/PR.md': '## Body\n', 'docs/server.yaml': 'name: x\n' })[p] ?? null;

const good = {
  repo: 'docker/mcp-registry',
  branch: 'add-gankdat',
  title: 'Add gankdat (remote)',
  body_file: 'docs/PR.md',
  files: { 'servers/gankdat/server.yaml': 'docs/server.yaml' },
};

describe('parsePrRequest', () => {
  it('reads a request, resolving the body file and defaulting the commit to the title', () => {
    expect(parsePrRequest(good, read)).toEqual({
      repo: 'docker/mcp-registry',
      branch: 'add-gankdat',
      title: 'Add gankdat (remote)',
      body: '## Body\n',
      commit: 'Add gankdat (remote)',
      files: { 'servers/gankdat/server.yaml': 'docs/server.yaml' },
    });
    expect(
      parsePrRequest({ ...good, body_file: undefined, body: 'inline', commit: 'c' }, read),
    ).toMatchObject({
      body: 'inline',
      commit: 'c',
    });
  });

  it('names the field that is wrong and never accepts a path outside the repo', () => {
    const bad: [Record<string, unknown>, RegExp][] = [
      [{ ...good, repo: 'docker' }, /repo/],
      [{ ...good, branch: '-x' }, /branch/],
      [{ ...good, title: '' }, /title/],
      [{ ...good, body_file: 'missing.md' }, /body_file not found/],
      [{ ...good, body_file: '../secret' }, /body_file/],
      [{ ...good, files: {} }, /at least one/],
      [{ ...good, files: { '../../etc/x': 'docs/server.yaml' } }, /unsafe published/],
      [{ ...good, files: { '.git/config': 'docs/server.yaml' } }, /unsafe published/],
      [{ ...good, files: { 'a.yaml': '/etc/passwd' } }, /unsafe source/],
      [{ ...good, files: { 'a.yaml': 'docs/nope.yaml' } }, /source not found/],
    ];
    for (const [input, re] of bad)
      expect(() => parsePrRequest(input, read), JSON.stringify(input)).toThrow(re);
    expect(() => parsePrRequest('x', read)).toThrow(/JSON object/);
  });
});
