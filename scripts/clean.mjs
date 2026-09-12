import { rm, mkdir } from 'node:fs/promises';

await rm('build', { recursive: true, force: true });
await mkdir('build', { recursive: true });
console.log('clean build directory ready');
