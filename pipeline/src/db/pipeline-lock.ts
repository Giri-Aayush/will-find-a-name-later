import { supabase } from './client.js';
import { logger } from '../utils/logger.js';

const STALE_LOCK_MINUTES = 45;

interface RunRecord {
  id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
}

/**
 * Try to acquire an exclusive pipeline lock.
 * Returns a run ID if acquired, null if another run is active.
 */
export async function acquireLock(): Promise<string | null> {
  // Check for active runs that aren't stale
  const cutoff = new Date(Date.now() - STALE_LOCK_MINUTES * 60 * 1000).toISOString();

  const { data: activeRuns } = await supabase
    .from('pipeline_runs')
    .select('id, status, started_at')
    .eq('status', 'running')
    .gt('started_at', cutoff);

  if (activeRuns && activeRuns.length > 0) {
    const run = activeRuns[0] as RunRecord;
    const elapsed = Math.round((Date.now() - new Date(run.started_at).getTime()) / 1000 / 60);
    logger.warn(`Pipeline lock held by run ${run.id} (started ${elapsed}m ago) — exiting`);
    return null;
  }

  // Mark any truly stale runs as failed (cleanup)
  const { data: staleRuns } = await supabase
    .from('pipeline_runs')
    .select('id')
    .eq('status', 'running')
    .lt('started_at', cutoff);

  if (staleRuns && staleRuns.length > 0) {
    for (const stale of staleRuns) {
      await supabase
        .from('pipeline_runs')
        .update({ status: 'failed', ended_at: new Date().toISOString(), error_message: 'Stale lock — auto-expired' })
        .eq('id', stale.id);
      logger.warn(`Auto-expired stale pipeline run: ${stale.id}`);
    }
  }

  // Insert new run
  const runnerId = process.env.GITHUB_RUN_ID ?? `local-${process.pid}`;
  const { data, error } = await supabase
    .from('pipeline_runs')
    .insert({ status: 'running', runner_id: runnerId })
    .select('id')
    .single();

  if (error || !data) {
    logger.error('Failed to acquire pipeline lock:', error);
    return null;
  }

  logger.info(`Pipeline lock acquired: ${data.id} (runner: ${runnerId})`);
  return data.id;
}

/**
 * Release the pipeline lock with final stats.
 */
export async function releaseLock(
  runId: string,
  result: {
    status: 'completed' | 'failed';
    itemsFetched?: number;
    cardsCreated?: number;
    cardsSkipped?: number;
    cardsFailed?: number;
    errorMessage?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('pipeline_runs')
    .update({
      status: result.status,
      ended_at: new Date().toISOString(),
      items_fetched: result.itemsFetched,
      cards_created: result.cardsCreated,
      cards_skipped: result.cardsSkipped,
      cards_failed: result.cardsFailed,
      error_message: result.errorMessage,
    })
    .eq('id', runId);

  if (error) {
    logger.error(`Failed to release pipeline lock ${runId}:`, error);
  } else {
    logger.info(`Pipeline lock released: ${runId} (${result.status})`);
  }
}
