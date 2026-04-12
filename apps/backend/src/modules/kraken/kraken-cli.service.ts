import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface KrakenErrorShape {
  category: string;
  message: string;
  suggestion?: string;
  retryable?: boolean;
}

export interface KrakenResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: KrakenErrorShape;
}

@Injectable()
export class KrakenCliService {
  private readonly logger = new Logger(KrakenCliService.name);

  async execute(args: string[]): Promise<KrakenResult> {
    const fullArgs = [...args, '-o', 'json'];
    try {
      const { stdout, stderr } = await execFileAsync('kraken', fullArgs, {
        timeout: 30_000,
        env: {
          ...process.env,
          KRAKEN_API_KEY: process.env.KRAKEN_API_KEY,
          KRAKEN_API_SECRET: process.env.KRAKEN_API_SECRET,
        },
        maxBuffer: 10 * 1024 * 1024,
      });
      if (stderr && !stdout) {
        this.logger.warn(`Kraken stderr: ${stderr}`);
      }
      const lines = stdout
        .trim()
        .split('\n')
        .filter((line) => line.length > 0);
      const results = lines.map((line) => JSON.parse(line) as unknown);
      return {
        success: true,
        data: (results.length === 1 ? results[0] : results) as unknown,
      };
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException & {
        stdout?: string;
        stderr?: string;
      };
      this.logger.error(`Kraken CLI error: ${error.message}`);
      const raw = error.stdout || error.stderr;
      if (raw) {
        try {
          const errData = JSON.parse(raw) as Record<string, unknown>;
          return {
            success: false,
            error: {
              category: String(errData.category ?? 'unknown'),
              message: String(errData.message ?? error.message),
              suggestion:
                typeof errData.suggestion === 'string'
                  ? errData.suggestion
                  : undefined,
              retryable: Boolean(errData.retryable),
            },
          };
        } catch {
          /* fall through */
        }
      }
      return {
        success: false,
        error: {
          category: 'execution',
          message: error.message ?? 'Unknown Kraken CLI error',
        },
      };
    }
  }
}
