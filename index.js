import { pathToFileURL } from 'node:url';
import { testAISDK } from './test-sdk-openai.js';
import { loadRuntimeConfig } from './constants.js';
import { testThinkFeel } from './test-sdk-thinkfeel.js';

export async function runAll(options = {}) {
  const log = options.log ?? console.log;
  const runOpenAI = options.runOpenAI ?? testAISDK;
  const runThinkFeel = options.runThinkFeel ?? testThinkFeel;
  const config = options.config ?? loadRuntimeConfig(options.env);

  log('Running ThinkFeel cookbook checks...\n');

  const openaiResult = await runOpenAI(config, { log });
  const thinkfeelResult = await runThinkFeel(config, { log });

  return { openaiResult, thinkfeelResult };
}

export async function main(options = {}) {
  const logError = options.error ?? console.error;
  const setProcessExitCode = options.setProcessExitCode ?? true;

  try {
    await runAll(options);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logError(`Cookbook run failed with error: ${message}`);
    if (setProcessExitCode) process.exitCode = 1;
    return 1;
  }
}

const isDirectExecution = typeof process.argv[1] === 'string' && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) await main();
