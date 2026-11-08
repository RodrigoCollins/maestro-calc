import { describe, expect, it } from 'vitest';
import { lookupZip, shardOf, type Shard } from './zip.ts';

const shard: Shard = {
  states: ['new-jersey', 'new-york'],
  stations: [
    [0, 'USW00000002'],
    [1, 'USW00000001'],
  ],
  zips: { '08201': [0, 6], '10001': [1, 4], '10002': [0, 0, 1] },
};

describe('shardOf', () => {
  it('names the shard file by the first digit of a 5-digit ZIP', () => {
    expect(shardOf('10001')).toBe('zip-1.json');
    expect(shardOf('08201')).toBe('zip-0.json');
    expect(shardOf('99950')).toBe('zip-9.json');
  });

  it('is undefined for anything that is not exactly five digits', () => {
    for (const bad of ['', '1000', '100011', '1000a', ' 10001', '10001 ', '１００01', '1e001']) {
      expect(shardOf(bad), bad).toBeUndefined();
    }
  });
});

describe('lookupZip', () => {
  it('decodes a two-value row: the ZIP is in the state of its station', () => {
    expect(lookupZip(shard, '10001')).toEqual({
      state: 'new-york',
      stationId: 'USW00000001',
      stationState: 'new-york',
      miles: 4,
    });
  });

  it('decodes a three-value row: the third value is the ZIP state', () => {
    expect(lookupZip(shard, '10002')).toEqual({
      state: 'new-york',
      stationId: 'USW00000002',
      stationState: 'new-jersey',
      miles: 0,
    });
  });

  it('is undefined for a ZIP that is not in the shard or is malformed', () => {
    expect(lookupZip(shard, '10003')).toBeUndefined();
    expect(lookupZip(shard, 'abc')).toBeUndefined();
    expect(lookupZip(shard, '__proto__')).toBeUndefined();
    expect(lookupZip(shard, 'constructor')).toBeUndefined();
  });

  it('is undefined for a row that points outside the tables', () => {
    expect(lookupZip({ ...shard, zips: { '10001': [9, 4] } }, '10001')).toBeUndefined();
    expect(lookupZip({ ...shard, zips: { '10001': [1, 4, 9] } }, '10001')).toBeUndefined();
  });

  it('is undefined for a row with no distance or a station with no state', () => {
    expect(lookupZip({ ...shard, zips: { '10001': [0] } }, '10001')).toBeUndefined();
    expect(lookupZip({ ...shard, stations: [[9, 'X']] }, '10001')).toBeUndefined();
    expect(lookupZip({ ...shard, zips: { '10001': [] } }, '10001')).toBeUndefined();
  });
});
