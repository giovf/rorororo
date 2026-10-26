// UK counterparty due-diligence agent on Meta's models — the CLI for the Meta Global AI Developer
// Hackathon entry (hackathons `meta-global-ai-hackathon-entry`, 2026-10-26). The loop lives in
// packages/landing/src/diligence-core.ts (the same file the /diligence page on apps.gankdat.com
// streams); this script adds the model choice from the environment and a transcript writer.
//
//   META_MODEL_API_KEY=LLM_… node --disable-warning=ExperimentalWarning scripts/meta-diligence-agent.ts "Acme Widgets Ltd"
//   node … scripts/meta-diligence-agent.ts --dry-run "Acme Widgets Ltd"      (no network: scripted model + fixtures)
//   node … scripts/meta-diligence-agent.ts --transcript walkthrough.md --out report.md "Acme Widgets Ltd"
//
// Model: Muse Spark on Meta Model API by default (https://api.meta.ai/v1, `muse-spark-1.3`, the
// US$150 of hackathon credits). The open-weight Muse Spark Open on a partner endpoint (Baseten,
// Modal, Fireworks — the hackathon's partner credits) is the same request with DILIGENCE_BASE_URL,
// DILIGENCE_MODEL and DILIGENCE_API_KEY set to that provider's values. GANKDAT_API_KEY is optional:
// without it gankdat's tools answer in preview mode (a few rows per register, a daily call cap).
import { writeFile } from 'node:fs/promises';
import process from 'node:process';
import {
  Budget,
  GANKDAT_MCP_URL,
  META_BASE_URL,
  META_DEFAULT_MODEL,
  REASONING_EFFORT,
  dryRunChat,
  dryRunTools,
  gankdatTools,
  openAiChat,
  runAgent,
  stepSummary,
  type ChatFn,
  type ModelConfig,
  type RunResult,
  type ToolCallFn,
  type ToolDef,
} from '../packages/landing/src/diligence-core.ts';

export interface Cli {
  company: string;
  dryRun: boolean;
  out?: string;
  transcript?: string;
}

export function parseCli(argv: string[]): Cli {
  const cli: Cli = { company: '', dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i] ?? '';
    if (a === '--dry-run') cli.dryRun = true;
    else if (a === '--out' || a === '--transcript') {
      const v = argv[++i];
      if (v !== undefined) {
        if (a === '--out') cli.out = v;
        else cli.transcript = v;
      }
    } else cli.company = cli.company ? `${cli.company} ${a}` : a;
  }
  return cli;
}

/**
 * The model from the environment: DILIGENCE_* names any OpenAI-compatible endpoint; absent, Meta
 * Model API with META_MODEL_API_KEY. Returns null (with the reason) when no key is set.
 */
export function modelFromEnv(
  env: Record<string, string | undefined>,
): { config: ModelConfig; provider: string } | { error: string } {
  const baseUrl = env['DILIGENCE_BASE_URL'] || META_BASE_URL;
  const apiKey = env['DILIGENCE_API_KEY'] || env['META_MODEL_API_KEY'];
  if (!apiKey)
    return {
      error:
        'no model key: set META_MODEL_API_KEY (docs/for-owner/actions/032-meta-model-api-key.md) or DILIGENCE_API_KEY with DILIGENCE_BASE_URL and DILIGENCE_MODEL for a partner endpoint; or use --dry-run',
    };
  const meta = new URL(baseUrl).hostname === 'api.meta.ai';
  const model = env['DILIGENCE_MODEL'] || (meta ? META_DEFAULT_MODEL : '');
  if (!model) return { error: `DILIGENCE_MODEL is required for ${baseUrl}` };
  const effort = env['DILIGENCE_REASONING_EFFORT'] ?? (meta ? REASONING_EFFORT : '');
  const config: ModelConfig = effort
    ? { baseUrl, model, apiKey, reasoningEffort: effort }
    : { baseUrl, model, apiKey };
  return { config, provider: meta ? 'Meta Model API' : new URL(baseUrl).hostname };
}

/** The walkthrough shape the entry's WALKTHROUGH.md carries: command, steps, report, cost line. */
export function transcript(
  company: string,
  provider: string,
  model: string,
  result: RunResult,
  dryRun: boolean,
): string {
  const cmd = `${dryRun ? '' : 'META_MODEL_API_KEY=… '}node --disable-warning=ExperimentalWarning scripts/meta-diligence-agent.ts ${dryRun ? '--dry-run ' : ''}"${company}"`;
  return [
    `# Agent walkthrough — ${model} on ${provider} runs a counterparty check through gankdat`,
    '',
    `${dryRun ? 'Dry-run' : 'Live'} transcript of \`scripts/meta-diligence-agent.ts\`${dryRun ? ' (scripted model, canned registers: the shape is exact, the figures are fixtures)' : ''}.`,
    '',
    '## Command',
    '',
    '```',
    `$ ${cmd}`,
    ...result.steps.map((s) => `→ ${stepSummary(s)}`),
    `model calls ${result.budget.calls}/${result.budget.maxCalls}, tokens ${result.budget.tokens}/${result.budget.maxTokens}${dryRun ? ' (dry run)' : ''}`,
    '```',
    '',
    '## Report',
    '',
    '```markdown',
    result.report.trim(),
    '```',
    '',
  ].join('\n');
}

async function main(): Promise<void> {
  const cli = parseCli(process.argv.slice(2));
  if (!cli.company) {
    console.error(
      'usage: meta-diligence-agent.ts [--dry-run] [--out report.md] [--transcript walkthrough.md] "<company name>"',
    );
    process.exitCode = 2;
    return;
  }
  let chat: ChatFn;
  let tools: { tools: ToolDef[]; callTool: ToolCallFn };
  let provider = 'dry run';
  let model = 'scripted';
  if (cli.dryRun) {
    chat = dryRunChat(cli.company);
    tools = dryRunTools();
  } else {
    const picked = modelFromEnv(process.env);
    if ('error' in picked) {
      console.error(picked.error);
      process.exitCode = 2;
      return;
    }
    provider = picked.provider;
    model = picked.config.model;
    chat = openAiChat(picked.config);
    tools = await gankdatTools(
      process.env['GANKDAT_MCP_URL'] ?? GANKDAT_MCP_URL,
      process.env['GANKDAT_API_KEY'],
    );
    console.error(`model ${model} on ${provider}; ${tools.tools.length} registers over MCP`);
  }
  const result = await runAgent({
    company: cli.company,
    chat,
    ...tools,
    budget: new Budget(),
    onStep: (s) => {
      console.error(`→ ${stepSummary(s)}`);
    },
  });
  console.error(
    `model calls ${result.budget.calls}/${result.budget.maxCalls}, tokens ${result.budget.tokens}/${result.budget.maxTokens}${cli.dryRun ? ' (dry run)' : ''}`,
  );
  if (cli.transcript)
    await writeFile(cli.transcript, transcript(cli.company, provider, model, result, cli.dryRun));
  if (cli.out) await writeFile(cli.out, `${result.report}\n`);
  else console.log(result.report);
}

if (process.argv[1]?.endsWith('meta-diligence-agent.ts')) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  });
}
