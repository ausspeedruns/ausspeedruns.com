import * as migration_20261120_061124_initial from './20261120_061124_initial.ts';

export const migrations = [
  {
    up: migration_20261120_061124_initial.up,
    down: migration_20261120_061124_initial.down,
    name: '20261120_061124_initial'
  },
];
