// Taskmaster rows without the MCP or the AI CLI.
//
// Why: gankdat's CLAUDE.md wants a Taskmaster task before a new module, but no routine could
// create one — the task-master-ai MCP times out at session start in every cloud sandbox
// (CONNECT_TIMEOUT on 2026-09-21, 22, 23, 24, 29 and twice on 09-30), the sandbox has no
// `task-master` CLI, and `npx -y task-master-ai` crashes there (ERR_MODULE_NOT_FOUND zod/v4).
// Every gankdat module then left a "file the Taskmaster row retrospectively" handoff in
// docs/ALERTS.md for the interactive session. The row needs no AI: tasks.json is plain JSON
// (`{ <tag>: { tasks: [...], metadata } }`), so this script appends one deterministically.
//
// Run: npm run task -- add --title "…" --description "…" [--details "…"] [--test "…"]
//                          [--priority high|medium|low] [--status pending|done|…]
//                          [--depends 3,4] [--tag master]              → prints the new id
//      npm run task -- status <id> <status> [--tag master]            → sets a task's status
//      npm run task -- done <id>                                        → status done
//      npm run task -- list [--tag master]                              → id | status | title
// `task-master generate` (the per-task markdown files) stays optional and is not run here.
// Node 22 runs .ts directly — keep syntax erasable, import only node builtins.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TASKS_FILE = path.join('.taskmaster', 'tasks', 'tasks.json');
export const STATUSES = [
  'pending',
  'in-progress',
  'done',
  'review',
  'deferred',
  'cancelled',
  'blocked',
] as const;
export type Status = (typeof STATUSES)[number];
export const PRIORITIES = ['high', 'medium', 'low'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  details: string;
  testStrategy: string;
  status: Status;
  dependencies: string[];
  priority: Priority;
  subtasks: unknown[];
  updatedAt: string;
  [extra: string]: unknown;
}

export interface TagData {
  tasks: Task[];
  metadata: {
    version?: string;
    lastModified: string;
    taskCount: number;
    completedCount: number;
    tags?: string[];
    [extra: string]: unknown;
  };
}

export type TasksFile = Record<string, TagData>;

export interface NewTask {
  title: string;
  description: string;
  details?: string;
  testStrategy?: string;
  status?: Status;
  priority?: Priority;
  dependencies?: string[];
}

const isStatus = (s: unknown): s is Status => STATUSES.includes(s as Status);
const isPriority = (p: unknown): p is Priority => PRIORITIES.includes(p as Priority);

/** Throws unless `db` has the tasks.json shape for `tag`; returns that tag's data. */
export function tagOf(db: unknown, tag: string): TagData {
  if (!db || typeof db !== 'object') throw new Error('tasks.json is not an object');
  const data = (db as Record<string, unknown>)[tag];
  if (!data || typeof data !== 'object') throw new Error(`tasks.json has no tag "${tag}"`);
  const { tasks, metadata } = data as Partial<TagData>;
  if (!Array.isArray(tasks)) throw new Error(`tag "${tag}" has no tasks array`);
  if (!metadata || typeof metadata !== 'object') throw new Error(`tag "${tag}" has no metadata`);
  for (const t of tasks) {
    if (!t || typeof t !== 'object' || typeof t.id !== 'string' || typeof t.title !== 'string') {
      throw new Error(`tag "${tag}" has a task without a string id and title`);
    }
  }
  return data as TagData;
}

const nextId = (tasks: Task[]): string =>
  String(tasks.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0) + 1);

function touch(data: TagData, now: Date): void {
  data.metadata.lastModified = now.toISOString();
  data.metadata.taskCount = data.tasks.length;
  data.metadata.completedCount = data.tasks.filter((t) => t.status === 'done').length;
}

/** Appends a task to `tag` (mutating `db`) and returns it. Ids are the next integer, as a string. */
export function addTask(db: TasksFile, tag: string, input: NewTask, now: Date): Task {
  const data = tagOf(db, tag);
  if (!input.title.trim()) throw new Error('--title is required');
  if (!input.description.trim()) throw new Error('--description is required');
  const status: string = input.status ?? 'pending';
  const priority: string = input.priority ?? 'medium';
  if (!isStatus(status)) throw new Error(`unknown status "${status}"`);
  if (!isPriority(priority)) throw new Error(`unknown priority "${priority}"`);
  const known = new Set(data.tasks.map((t) => t.id));
  for (const dep of input.dependencies ?? []) {
    if (!known.has(dep)) throw new Error(`dependency ${dep} is not a task in "${tag}"`);
  }
  const task: Task = {
    id: nextId(data.tasks),
    title: input.title.trim(),
    description: input.description.trim(),
    details: input.details?.trim() ?? '',
    testStrategy: input.testStrategy?.trim() ?? '',
    status,
    dependencies: input.dependencies ?? [],
    priority,
    subtasks: [],
    updatedAt: now.toISOString(),
  };
  data.tasks.push(task);
  touch(data, now);
  return task;
}

/** Sets a task's status (mutating `db`) and returns the task. */
export function setStatus(db: TasksFile, tag: string, id: string, status: string, now: Date): Task {
  const data = tagOf(db, tag);
  if (!isStatus(status)) throw new Error(`unknown status "${status}" (${STATUSES.join(', ')})`);
  const task = data.tasks.find((t) => t.id === id);
  if (!task) throw new Error(`no task ${id} in "${tag}"`);
  task.status = status;
  task.updatedAt = now.toISOString();
  touch(data, now);
  return task;
}

export interface Args {
  command: string;
  positional: string[];
  flags: Record<string, string>;
}

/** `--key value` and `--key=value` flags; everything else is positional. */
export function parseArgs(argv: string[]): Args {
  const [command = '', ...rest] = argv;
  const flags: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i] as string;
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const eq = arg.indexOf('=');
    if (eq !== -1) {
      flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      continue;
    }
    const next = rest[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags[arg.slice(2)] = next;
      i += 1;
    } else {
      flags[arg.slice(2)] = 'true';
    }
  }
  return { command, positional, flags };
}

/** The NewTask an `add` invocation describes. */
export function newTaskFromFlags(flags: Record<string, string>): NewTask {
  const task: NewTask = { title: flags.title ?? '', description: flags.description ?? '' };
  if (flags.details) task.details = flags.details;
  if (flags.test) task.testStrategy = flags.test;
  if (flags.status) task.status = flags.status as Status;
  if (flags.priority) task.priority = flags.priority as Priority;
  if (flags.depends) {
    task.dependencies = flags.depends
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
  }
  return task;
}

/** JSON text as Taskmaster writes it: two-space indent, trailing newline. */
export const serialize = (db: TasksFile): string => `${JSON.stringify(db, null, 2)}\n`;

function main(): void {
  const { command, positional, flags } = parseArgs(process.argv.slice(2));
  const root = path.resolve(import.meta.dirname, '..');
  const file = path.join(root, TASKS_FILE);
  const db = JSON.parse(readFileSync(file, 'utf8')) as TasksFile;
  const tag = flags.tag ?? 'master';
  const now = new Date();
  switch (command) {
    case 'add': {
      const task = addTask(db, tag, newTaskFromFlags(flags), now);
      writeFileSync(file, serialize(db));
      console.log(`${task.id} | ${task.status} | ${task.title}`);
      return;
    }
    case 'status':
    case 'done': {
      const [id, status = command === 'done' ? 'done' : ''] = positional;
      if (!id) throw new Error(`usage: ${command} <id>${command === 'status' ? ' <status>' : ''}`);
      const task = setStatus(db, tag, id, status, now);
      writeFileSync(file, serialize(db));
      console.log(`${task.id} | ${task.status} | ${task.title}`);
      return;
    }
    case 'list': {
      for (const t of tagOf(db, tag).tasks) console.log(`${t.id} | ${t.status} | ${t.title}`);
      return;
    }
    default:
      throw new Error(
        'usage: task -- add|status|done|list … (see the header of scripts/taskmaster-add.ts)',
      );
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
