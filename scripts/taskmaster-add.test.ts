import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  addTask,
  newTaskFromFlags,
  parseArgs,
  serialize,
  setStatus,
  tagOf,
  TASKS_FILE,
  type TasksFile,
} from './taskmaster-add.ts';

const now = new Date('2026-09-30T20:00:00Z');

const fixture = (): TasksFile => ({
  master: {
    tasks: [
      {
        id: '1',
        title: 'First',
        description: 'd',
        details: '',
        testStrategy: '',
        status: 'done',
        dependencies: [],
        priority: 'high',
        subtasks: [],
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: '2',
        title: 'Second',
        description: 'd',
        details: '',
        testStrategy: '',
        status: 'pending',
        dependencies: ['1'],
        priority: 'medium',
        subtasks: [],
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
    ],
    metadata: {
      version: '1.0.0',
      lastModified: '2026-09-01T00:00:00.000Z',
      taskCount: 2,
      completedCount: 1,
      tags: ['master'],
    },
  },
});

describe('tagOf', () => {
  it('accepts the real tasks.json', () => {
    const db = JSON.parse(readFileSync(TASKS_FILE, 'utf8')) as TasksFile;
    const master = tagOf(db, 'master');
    expect(master.tasks.length).toBeGreaterThan(0);
    expect(master.metadata.taskCount).toBe(master.tasks.length);
  });

  it('rejects anything that is not the tasks.json shape', () => {
    expect(() => tagOf(null, 'master')).toThrow('not an object');
    expect(() => tagOf({}, 'master')).toThrow('no tag "master"');
    expect(() => tagOf({ master: { tasks: 'x' } }, 'master')).toThrow('no tasks array');
    expect(() => tagOf({ master: { tasks: [], metadata: null } }, 'master')).toThrow('no metadata');
    expect(() => tagOf({ master: { tasks: [{ id: 3 }], metadata: {} } }, 'master')).toThrow(
      'string id',
    );
  });
});

describe('addTask', () => {
  it('appends with the next id, defaults, and refreshed metadata', () => {
    const db = fixture();
    const task = addTask(db, 'master', { title: ' New ', description: 'why' }, now);
    expect(task).toEqual({
      id: '3',
      title: 'New',
      description: 'why',
      details: '',
      testStrategy: '',
      status: 'pending',
      dependencies: [],
      priority: 'medium',
      subtasks: [],
      updatedAt: '2026-09-30T20:00:00.000Z',
    });
    expect(db.master?.tasks.at(-1)).toBe(task);
    expect(db.master?.metadata).toMatchObject({
      lastModified: '2026-09-30T20:00:00.000Z',
      taskCount: 3,
      completedCount: 1,
      version: '1.0.0',
    });
  });

  it('files a done row with dependencies and counts it as completed', () => {
    const db = fixture();
    addTask(
      db,
      'master',
      { title: 'Shipped', description: 'd', status: 'done', priority: 'high', dependencies: ['1'] },
      now,
    );
    expect(db.master?.metadata.completedCount).toBe(2);
  });

  it('refuses a missing title, an unknown status or priority, and a dependency that is not a task', () => {
    expect(() => addTask(fixture(), 'master', { title: '', description: 'd' }, now)).toThrow(
      '--title',
    );
    expect(() => addTask(fixture(), 'master', { title: 't', description: ' ' }, now)).toThrow(
      '--description',
    );
    expect(() =>
      addTask(
        fixture(),
        'master',
        { title: 't', description: 'd', status: 'shipped' as never },
        now,
      ),
    ).toThrow('unknown status');
    expect(() =>
      addTask(
        fixture(),
        'master',
        { title: 't', description: 'd', priority: 'urgent' as never },
        now,
      ),
    ).toThrow('unknown priority');
    expect(() =>
      addTask(fixture(), 'master', { title: 't', description: 'd', dependencies: ['9'] }, now),
    ).toThrow('dependency 9');
  });
});

describe('setStatus', () => {
  it('updates the task and the completed count', () => {
    const db = fixture();
    const task = setStatus(db, 'master', '2', 'done', now);
    expect(task.status).toBe('done');
    expect(task.updatedAt).toBe('2026-09-30T20:00:00.000Z');
    expect(db.master?.metadata.completedCount).toBe(2);
    expect(() => setStatus(db, 'master', '9', 'done', now)).toThrow('no task 9');
    expect(() => setStatus(db, 'master', '2', 'finished', now)).toThrow('unknown status');
  });
});

describe('parseArgs + newTaskFromFlags', () => {
  it('reads --key value, --key=value, positionals and bare flags', () => {
    const args = parseArgs([
      'add',
      '--title',
      'A title',
      '--description=Why it exists',
      '--depends',
      '1, 2',
      '--status',
      'done',
      '--dry',
    ]);
    expect(args.command).toBe('add');
    expect(args.flags).toEqual({
      title: 'A title',
      description: 'Why it exists',
      depends: '1, 2',
      status: 'done',
      dry: 'true',
    });
    expect(newTaskFromFlags(args.flags)).toEqual({
      title: 'A title',
      description: 'Why it exists',
      status: 'done',
      dependencies: ['1', '2'],
    });
    expect(parseArgs(['status', '5', 'done'])).toEqual({
      command: 'status',
      positional: ['5', 'done'],
      flags: {},
    });
  });
});

describe('serialize', () => {
  it('writes the file the way Taskmaster does: two-space indent and a trailing newline', () => {
    const text = serialize(fixture());
    expect(text.startsWith('{\n  "master": {\n    "tasks": [\n')).toBe(true);
    expect(text.endsWith('}\n')).toBe(true);
    expect(JSON.parse(text)).toEqual(fixture());
  });
});
