import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function loadFreshConfig() {
  vi.resetModules();
  const { loadConfig } = await import('../config.js');
  return loadConfig();
}

describe('loadConfig', () => {
  it('returns config with all required fields', async () => {
    const config = await loadFreshConfig();

    expect(config).toHaveProperty('env');
    expect(config).toHaveProperty('supabaseUrl');
    expect(config).toHaveProperty('supabaseServiceKey');
    expect(config).toHaveProperty('githubPat');
    expect(config).toHaveProperty('openaiApiKey');
    expect(config).toHaveProperty('batchSize');
    expect(config).toHaveProperty('concurrency');
    expect(config).toHaveProperty('dryRun');
  });

  it('throws when SUPABASE_URL missing', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    await expect(loadFreshConfig()).rejects.toThrow('Missing required environment variable: SUPABASE_URL');
  });

  it('throws when SUPABASE_SERVICE_KEY missing', async () => {
    vi.stubEnv('SUPABASE_SERVICE_KEY', '');
    await expect(loadFreshConfig()).rejects.toThrow('Missing required environment variable: SUPABASE_SERVICE_KEY');
  });

  it('defaults PIPELINE_ENV to dev', async () => {
    // PIPELINE_ENV is set to 'dev' in vitest.config.ts, but let's explicitly unset it
    vi.stubEnv('PIPELINE_ENV', '');
    // When PIPELINE_ENV is empty string, ?? operator won't kick in since '' is falsy only for ||
    // Actually '' ?? 'dev' = '' because ?? only checks null/undefined
    // So let's delete it instead
    delete process.env.PIPELINE_ENV;
    const config = await loadFreshConfig();
    expect(config.env).toBe('dev');
  });

  it('defaults githubPat to empty string', async () => {
    vi.stubEnv('GITHUB_PAT', '');
    delete process.env.GITHUB_PAT;
    const config = await loadFreshConfig();
    expect(config.githubPat).toBe('');
  });

  it('defaults openaiApiKey to empty string', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    delete process.env.OPENAI_API_KEY;
    const config = await loadFreshConfig();
    expect(config.openaiApiKey).toBe('');
  });

  it('throws when PIPELINE_ENV=prod and OPENAI_API_KEY missing', async () => {
    vi.stubEnv('PIPELINE_ENV', 'prod');
    delete process.env.OPENAI_API_KEY;
    await expect(loadFreshConfig()).rejects.toThrow('OPENAI_API_KEY is required when PIPELINE_ENV=prod');
  });

  it('defaults batchSize to 200', async () => {
    delete process.env.BATCH_SIZE;
    const config = await loadFreshConfig();
    expect(config.batchSize).toBe(200);
  });

  it('sets concurrency=1 in dev', async () => {
    vi.stubEnv('PIPELINE_ENV', 'dev');
    delete process.env.CONCURRENCY;
    const config = await loadFreshConfig();
    expect(config.concurrency).toBe(1);
  });

  it('defaults dryRun to false', async () => {
    delete process.env.DRY_RUN;
    const config = await loadFreshConfig();
    expect(config.dryRun).toBe(false);
  });

  it('sets dryRun to true when DRY_RUN=true', async () => {
    vi.stubEnv('DRY_RUN', 'true');
    const config = await loadFreshConfig();
    expect(config.dryRun).toBe(true);
  });

  it('returns NaN for batchSize when BATCH_SIZE is non-numeric string', async () => {
    vi.stubEnv('BATCH_SIZE', 'not-a-number');
    const config = await loadFreshConfig();
    // parseInt('not-a-number', 10) returns NaN
    expect(config.batchSize).toBeNaN();
  });

  it('accepts PIPELINE_ENV=staging without throwing', async () => {
    vi.stubEnv('PIPELINE_ENV', 'staging');
    const config = await loadFreshConfig();
    // The code casts any string as PipelineEnv, so 'staging' is accepted
    expect(config.env).toBe('staging');
  });
});
