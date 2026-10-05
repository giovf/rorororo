import { describe, expect, it } from 'vitest';
import { planRelink, type BoundSite, type LibraryVariableRef, type ReferencedVariable } from './relink.js';

const lib = (key: string, name: string, type = 'COLOR', collectionKey = 'col-1', libraryName = 'Brand'): LibraryVariableRef => ({
  key,
  name,
  type,
  collectionKey,
  collectionName: 'Tokens',
  libraryName,
});
const local = (id: string, name: string, type = 'COLOR'): ReferencedVariable => ({ id, name, type, remote: false, key: `local-${id}` });
const remote = (id: string, name: string, key: string, type = 'COLOR'): ReferencedVariable => ({ id, name, type, remote: true, key });
const paint = (nodeId: string, variableId: string, index = 0): BoundSite => ({
  nodeId,
  nodeName: nodeId,
  target: { kind: 'paint', property: 'fills', index },
  variableId,
});
const field = (nodeId: string, variableId: string): BoundSite => ({ nodeId, nodeName: nodeId, target: { kind: 'field', field: 'paddingTop' }, variableId });

describe('planRelink', () => {
  it('moves layers bound to a local variable onto the library variable with the same name and type', () => {
    const plan = planRelink([paint('n1', 'v1'), paint('n2', 'v1', 1), field('n3', 'v2')], [local('v1', 'color/brand'), local('v2', 'space/md', 'FLOAT')], [
      lib('k1', 'color/brand'),
      lib('k2', 'space/md', 'FLOAT'),
    ]);
    expect(plan.groups.map((g) => [g.library.key, g.sites.length])).toEqual([
      ['k1', 2],
      ['k2', 1],
    ]);
    expect(plan.groups[0]?.from).toEqual([{ id: 'v1', name: 'color/brand', reason: 'local' }]);
    expect(plan.unmatched).toEqual([]);
    expect(plan.current).toBe(0);
  });

  it('never matches across types, and lists the variable as unmatched instead', () => {
    const plan = planRelink([field('n1', 'v1')], [local('v1', 'color/brand', 'FLOAT')], [lib('k1', 'color/brand', 'COLOR')]);
    expect(plan.groups).toEqual([]);
    expect(plan.unmatched).toEqual([{ variable: local('v1', 'color/brand', 'FLOAT'), sites: 1 }]);
  });

  it('relinks a stale library binding whose key is no longer published, and leaves current ones alone', () => {
    const plan = planRelink(
      [paint('n1', 'old'), paint('n2', 'ok')],
      [remote('old', 'color/brand', 'k-unpublished'), remote('ok', 'color/accent', 'k2')],
      [lib('k1', 'color/brand'), lib('k2', 'color/accent')],
    );
    expect(plan.groups).toHaveLength(1);
    expect(plan.groups[0]?.library.key).toBe('k1');
    expect(plan.groups[0]?.from[0]?.reason).toBe('stale-library');
    expect(plan.current).toBe(1);
  });

  it('treats a local variable that is itself published as current (the file is the library)', () => {
    const published: ReferencedVariable = { id: 'v1', name: 'color/brand', type: 'COLOR', remote: false, key: 'k1' };
    const plan = planRelink([paint('n1', 'v1')], [published], [lib('k1', 'color/brand')]);
    expect(plan.groups).toEqual([]);
    expect(plan.current).toBe(1);
  });

  it('reports a name published by two libraries as ambiguous until a collection is chosen', () => {
    const library = [lib('k1', 'color/brand', 'COLOR', 'col-a', 'Brand A'), lib('k9', 'color/brand', 'COLOR', 'col-b', 'Brand B')];
    const sites = [paint('n1', 'v1'), paint('n2', 'v1')];
    const plan = planRelink(sites, [local('v1', 'color/brand')], library);
    expect(plan.groups).toEqual([]);
    expect(plan.ambiguous).toEqual([{ variable: local('v1', 'color/brand'), candidates: library, sites: 2 }]);

    const chosen = planRelink(sites, [local('v1', 'color/brand')], library, { collectionKeys: new Set(['col-b']) });
    expect(chosen.ambiguous).toEqual([]);
    expect(chosen.groups.map((g) => g.library.key)).toEqual(['k9']);
  });

  it('counts bindings to variables the file no longer knows as orphaned, and merges two sources into one target', () => {
    const plan = planRelink(
      [paint('n1', 'gone'), paint('n2', 'a'), paint('n3', 'b')],
      [local('a', 'color/brand'), remote('b', 'color/brand', 'k-old')],
      [lib('k1', 'color/brand')],
    );
    expect(plan.orphaned).toBe(1);
    expect(plan.groups).toHaveLength(1);
    expect(plan.groups[0]?.sites.map((s) => s.nodeId)).toEqual(['n2', 'n3']);
    expect(plan.groups[0]?.from.map((f) => f.reason)).toEqual(['local', 'stale-library']);
  });

  it('ignores surrounding whitespace in names and orders groups by site count', () => {
    const plan = planRelink(
      [paint('n1', 'a'), paint('n2', 'b'), paint('n3', 'b')],
      [local('a', 'color/one '), local('b', ' color/two')],
      [lib('k1', 'color/one'), lib('k2', 'color/two')],
    );
    expect(plan.groups.map((g) => g.library.key)).toEqual(['k2', 'k1']);
  });

  describe('to-local', () => {
    const locals = [lib('loc-1', 'color/brand', 'COLOR', 'col-local', 'This file'), lib('loc-2', 'space/md', 'FLOAT', 'col-local', 'This file')];

    it('moves library bindings (available or not) onto the local variable of the same name and type, leaving local ones alone', () => {
      const plan = planRelink(
        [paint('n1', 'lib-a'), paint('n2', 'lib-a', 1), field('n3', 'lib-b'), paint('n4', 'mine')],
        [remote('lib-a', 'color/brand', 'k1'), remote('lib-b', 'space/md', 'k2', 'FLOAT'), local('mine', 'color/accent')],
        locals,
        { direction: 'to-local' },
      );
      expect(plan.direction).toBe('to-local');
      expect(plan.groups.map((g) => [g.library.key, g.sites.length])).toEqual([
        ['loc-1', 2],
        ['loc-2', 1],
      ]);
      expect(plan.groups[0]?.from).toEqual([{ id: 'lib-a', name: 'color/brand', reason: 'library' }]);
      expect(plan.current).toBe(1);
      expect(plan.unmatched).toEqual([]);
    });

    it('lists a library variable with no local twin as unmatched and never matches across types', () => {
      const plan = planRelink([paint('n1', 'lib-a'), field('n2', 'lib-c')], [remote('lib-a', 'color/other', 'k1'), remote('lib-c', 'color/brand', 'k3', 'FLOAT')], locals, {
        direction: 'to-local',
      });
      expect(plan.groups).toEqual([]);
      expect(plan.unmatched.map((u) => u.variable.id).sort()).toEqual(['lib-a', 'lib-c']);
    });

    it('does not treat a local variable as current in the to-library direction, nor a library one as current to-local', () => {
      const sites = [paint('n1', 'mine')];
      const toLibrary = planRelink(sites, [local('mine', 'color/brand')], [lib('k1', 'color/brand')]);
      expect(toLibrary.direction).toBe('to-library');
      expect(toLibrary.groups).toHaveLength(1);
      const toLocal = planRelink(sites, [local('mine', 'color/brand')], locals, { direction: 'to-local' });
      expect(toLocal.groups).toEqual([]);
      expect(toLocal.current).toBe(1);
    });

    it('reports a name in two local collections as ambiguous until one is chosen', () => {
      const twins = [lib('loc-1', 'color/brand', 'COLOR', 'col-a', 'This file'), lib('loc-9', 'color/brand', 'COLOR', 'col-b', 'This file')];
      const sites = [paint('n1', 'lib-a')];
      const known = [remote('lib-a', 'color/brand', 'k1')];
      expect(planRelink(sites, known, twins, { direction: 'to-local' }).ambiguous).toHaveLength(1);
      const chosen = planRelink(sites, known, twins, { direction: 'to-local', collectionKeys: new Set(['col-b']) });
      expect(chosen.ambiguous).toEqual([]);
      expect(chosen.groups.map((g) => g.library.key)).toEqual(['loc-9']);
    });
  });
});
