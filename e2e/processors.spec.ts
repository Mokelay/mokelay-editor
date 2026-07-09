import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('normalizes configs and executes processors in order without mutating input', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const processors = await import('/src/processors/index.ts');
    const input = [{ name: ' Ada ', age: 20 }, { name: ' Bob ', age: 15 }];
    const output = processors.applyProcessors(input, [
      {
        processor: 'filter',
        param: {
          type: 'and',
          conditions: [{ variable: 'age', condition: 'gt', value: 18 }]
        }
      },
      { processor: 'merge_data', param: [{ enabled: true }] }
    ]);

    return {
      normalized: processors.normalizeProcessors([
        ' trim ',
        { processor: ' merge_data ', param: [{ role: 'admin' }] },
        '',
        null
      ]),
      input,
      output
    };
  });

  expect(result.normalized).toEqual([
    'trim',
    { processor: 'merge_data', param: [{ role: 'admin' }] }
  ]);
  expect(result.output).toEqual([{ name: ' Ada ', age: 20, enabled: true }]);
  expect(result.input).toEqual([{ name: ' Ada ', age: 20 }, { name: ' Bob ', age: 15 }]);
});

test('supports trim, merge_data, filter conditions, and type mismatches', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { applyProcessor } = await import('/src/processors/index.ts');
    return {
      trim: applyProcessor('  hello  ', 'trim'),
      trimMismatch: applyProcessor(12, 'trim'),
      mergeObject: applyProcessor({ id: 1, state: 'old' }, {
        processor: 'merge_data',
        param: { state: 'new', active: true }
      }),
      mergeArray: applyProcessor([{ id: 1 }, 'unchanged'], {
        processor: 'merge_data',
        param: [{ active: true }]
      }),
      mergeMismatch: applyProcessor('value', { processor: 'merge_data', param: [{}] }),
      filterOr: applyProcessor([
        { profile: { name: 'Ada' }, age: 20, note: '' },
        { profile: { name: 'Bob' }, age: 15, note: 'ok' },
        { profile: { name: 'Grace' }, age: 30, note: null }
      ], {
        processor: 'filter',
        param: {
          type: 'or',
          conditions: [
            { variable: 'profile.name', condition: 'eq', value: 'Bob' },
            { variable: 'note', condition: 'is_empty' }
          ]
        }
      }),
      filterMismatch: applyProcessor({ id: 1 }, {
        processor: 'filter',
        param: { type: 'and', conditions: [] }
      })
    };
  });

  expect(result).toEqual({
    trim: 'hello',
    trimMismatch: 12,
    mergeObject: { id: 1, state: 'new', active: true },
    mergeArray: [{ id: 1, active: true }, 'unchanged'],
    mergeMismatch: 'value',
    filterOr: [
      { profile: { name: 'Ada' }, age: 20, note: '' },
      { profile: { name: 'Bob' }, age: 15, note: 'ok' },
      { profile: { name: 'Grace' }, age: 30, note: null }
    ],
    filterMismatch: { id: 1 }
  });
});

test('formats valid dates in browser local time and returns failed conversions unchanged', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { applyProcessor } = await import('/src/processors/index.ts');
    const timestamp = Date.UTC(2026, 5, 15, 4, 5, 6);
    const local = new Date(timestamp);
    const pad = (value: number) => String(value).padStart(2, '0');
    const expected = `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())} ` +
      `${pad(local.getHours())}:${pad(local.getMinutes())}:${pad(local.getSeconds())}`;
    return {
      formatted: applyProcessor(timestamp, {
        processor: 'date_time_format',
        param: 'yyyy-MM-dd HH:mm:SS'
      }),
      dateObject: applyProcessor(new Date(timestamp), {
        processor: 'date_time_format',
        param: 'yyyy-MM-dd HH:mm:SS'
      }),
      isoString: applyProcessor(new Date(timestamp).toISOString(), {
        processor: 'date_time_format',
        param: 'yyyy-MM-dd HH:mm:SS'
      }),
      expected,
      invalid: applyProcessor('not-a-date', {
        processor: 'date_time_format',
        param: 'yyyy-MM-dd'
      }),
      mismatch: applyProcessor({ timestamp }, {
        processor: 'date_time_format',
        param: 'yyyy-MM-dd'
      })
    };
  });

  expect(result.formatted).toBe(result.expected);
  expect(result.dateObject).toBe(result.expected);
  expect(result.isoString).toBe(result.expected);
  expect(result.invalid).toBe('not-a-date');
  expect(result.mismatch).toEqual({ timestamp: Date.UTC(2026, 5, 15, 4, 5, 6) });
});

test('generates random_id strings with defaults, shorthands, and fallback params', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { applyProcessor } = await import('/src/processors/index.ts');
    return {
      defaultId: applyProcessor('', {
        processor: 'random_id',
        param: { prefix: 'api_', length: 6 }
      }),
      keepsExisting: applyProcessor('existing_api', 'random_id'),
      alwaysId: applyProcessor('existing_api', {
        processor: 'random_id',
        param: { prefix: 'api_', length: 4, when: 'always' }
      }),
      stringShorthand: applyProcessor(null, { processor: 'random_id', param: 'api_' }),
      numberShorthand: applyProcessor(undefined, { processor: 'random_id', param: 8 }),
      customAlphabet: applyProcessor('', {
        processor: 'random_id',
        param: { prefix: 'ID_', length: 4, alphabet: 'AB', lowerCase: false }
      }),
      invalidFallback: applyProcessor('', {
        processor: 'random_id',
        param: { length: -1, alphabet: '', when: 'sometimes' }
      }),
      mismatch: applyProcessor({ id: 1 }, {
        processor: 'random_id',
        param: { prefix: 'api_', length: 4 }
      })
    };
  });

  expect(result.defaultId).toMatch(/^api_[a-z0-9]{6}$/);
  expect(result.keepsExisting).toBe('existing_api');
  expect(result.alwaysId).toMatch(/^api_[a-z0-9]{4}$/);
  expect(result.alwaysId).not.toBe('existing_api');
  expect(result.stringShorthand).toMatch(/^api_[a-z0-9]{6}$/);
  expect(result.numberShorthand).toMatch(/^[a-z0-9]{8}$/);
  expect(result.customAlphabet).toMatch(/^ID_[AB]{4}$/);
  expect(result.invalidFallback).toMatch(/^[a-z0-9]{6}$/);
  expect(result.mismatch).toMatch(/^api_[a-z0-9]{4}$/);
});

test('reports invalid and unsupported processor configs with stable error codes', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { applyProcessor } = await import('/src/processors/index.ts');
    const readError = (callback: () => unknown) => {
      try {
        callback();
        return null;
      } catch (error) {
        return {
          code: (error as { code?: string }).code,
          message: error instanceof Error ? error.message : String(error)
        };
      }
    };

    return {
      unsupported: readError(() => applyProcessor('value', 'missing_processor')),
      merge: readError(() => applyProcessor({}, { processor: 'merge_data', param: [] })),
      filter: readError(() => applyProcessor([], {
        processor: 'filter',
        param: { type: 'and', conditions: [{ variable: '', condition: 'eq', value: 1 }] }
      })),
      date: readError(() => applyProcessor(0, { processor: 'date_time_format', param: '' }))
    };
  });

  expect(result.unsupported?.code).toBe('PROCESSOR_UNSUPPORTED');
  expect(result.merge?.code).toBe('PROCESSOR_INVALID_CONFIG');
  expect(result.filter?.code).toBe('PROCESSOR_INVALID_CONFIG');
  expect(result.date?.code).toBe('PROCESSOR_INVALID_CONFIG');
});

test('previews ordinary and array field paths while preserving nested array structure', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const {
      extractSchemaSelectionValue,
      previewSchemaSelection
    } = await import('/src/processors/index.ts');
    const input = {
      profile: { name: ' Ada ' },
      data: {
        groups: [
          { members: [{ name: ' Grace ' }, { id: 2 }] },
          { members: [] },
          { members: [{ name: ' Lin ' }] }
        ]
      }
    };

    return {
      input,
      unprocessed: previewSchemaSelection(input, { path: 'profile.name' }),
      ordinary: previewSchemaSelection(input, { path: 'profile.name', processors: ['trim'] }),
      nested: previewSchemaSelection(input, { path: 'data.groups[].members[].name', processors: ['trim'] }),
      extracted: extractSchemaSelectionValue(input, 'data.groups[].members[].name')
    };
  });

  expect(result.ordinary).toEqual({ extractedValue: ' Ada ', finalValue: 'Ada' });
  expect(result.unprocessed).toEqual({ extractedValue: ' Ada ', finalValue: ' Ada ' });
  expect(result.nested).toEqual({
    extractedValue: [[' Grace ', null], [], [' Lin ']],
    finalValue: [['Grace', null], [], ['Lin']]
  });
  expect(result.extracted).toEqual([[' Grace ', null], [], [' Lin ']]);
  expect(result.input).toEqual({
    profile: { name: ' Ada ' },
    data: {
      groups: [
        { members: [{ name: ' Grace ' }, { id: 2 }] },
        { members: [] },
        { members: [{ name: ' Lin ' }] }
      ]
    }
  });
});

test('applies processors to an array when the selected path ends with an array marker', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { previewSchemaSelection } = await import('/src/processors/index.ts');
    const input = {
      users: [
        { name: 'Ada', age: 20 },
        { name: 'Bob', age: 15 }
      ]
    };
    return previewSchemaSelection(input, {
      path: 'users[]',
      processors: [
        {
          processor: 'filter',
          param: {
            type: 'and',
            conditions: [{ variable: 'age', condition: 'gt', value: 18 }]
          }
        },
        { processor: 'merge_data', param: [{ visible: true }] }
      ]
    });
  });

  expect(result).toEqual({
    extractedValue: [
      { name: 'Ada', age: 20 },
      { name: 'Bob', age: 15 }
    ],
    finalValue: [{ name: 'Ada', age: 20, visible: true }]
  });
});

test('reports missing and invalid preview paths and propagates Processor errors', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { previewSchemaSelection } = await import('/src/processors/index.ts');
    const readError = (callback: () => unknown) => {
      try {
        callback();
        return null;
      } catch (error) {
        return {
          code: (error as { code?: string }).code,
          message: error instanceof Error ? error.message : String(error)
        };
      }
    };

    return {
      missing: readError(() => previewSchemaSelection({ users: [{ id: 1 }] }, {
        path: 'users[].name'
      })),
      invalid: readError(() => previewSchemaSelection({ users: [] }, {
        path: 'users[0].name'
      })),
      unsupported: readError(() => previewSchemaSelection({ name: 'Ada' }, {
        path: 'name',
        processors: ['future_processor']
      }))
    };
  });

  expect(result.missing?.code).toBe('FIELD_PREVIEW_PATH_NOT_FOUND');
  expect(result.invalid?.code).toBe('FIELD_PREVIEW_INVALID_PATH');
  expect(result.unsupported?.code).toBe('PROCESSOR_UNSUPPORTED');
});
