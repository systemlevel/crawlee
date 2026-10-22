import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

import { describe, expect, it } from 'vitest';

function dockerfiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return dockerfiles(path);
        return entry.name === 'Dockerfile' ? [path] : [];
    });
}

describe('generated and E2E image Node security floor', () => {
    for (const file of [...dockerfiles('packages/templates/templates'), ...dockerfiles('test/e2e')]) {
        it(`${file} rejects the vulnerable October Node build in each Node base stage`, () => {
            const source = readFileSync(file, 'utf8');
            const stages = source.split(/^FROM /m).slice(1);
            for (const stage of stages) {
                if (!/^(?:node:|apify\/actor-node)/.test(stage)) continue;
                const guard = stage.match(/\nRUN node -e "([^"\n]+)"/);
                expect(
                    guard,
                    'Node base stages must reject vulnerable vendor runtimes before installing packages',
                ).not.toBeNull();
                const code = guard![1];
                for (const node of ['20.20.0', '24.21.0', '24.22.0']) {
                    expect(() => runInNewContext(code, { process: { versions: { node } } })).toThrow();
                }
                for (const node of ['24.22.1', '24.23.0']) {
                    expect(() => runInNewContext(code, { process: { versions: { node } } })).not.toThrow();
                }
            }
        });
    }
});
