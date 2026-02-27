function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig() {
  return {
    supabaseUrl: requireEnv('SUPABASE_URL'),
    supabaseServiceKey: requireEnv('SUPABASE_SERVICE_KEY'),
    githubPat: process.env.GITHUB_PAT ?? '',
    // AI API keys — optional when using local Ollama
    groqApiKey: process.env.GROQ_API_KEY ?? '',
    cryptoPanicApiKey: process.env.CRYPTOPANIC_API_KEY ?? '',
    pipelineVersion: process.env.PIPELINE_VERSION ?? '0.1.0',
    logLevel: (process.env.LOG_LEVEL ?? 'info') as 'debug' | 'info' | 'warn' | 'error',
    dryRun: process.env.DRY_RUN === 'true',
  };
}

export type Config = ReturnType<typeof loadConfig>;
