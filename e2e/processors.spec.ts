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

test('builds an AI DSL payload from request JSON and the latest successful turns', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { applyProcessor, getProcessorDefinition } = await import('/src/processors/index.ts');
    const response = (summary: string, marker: string) => ({
      version: 1,
      status: 'complete',
      summary,
      pages: [{ uuid: `${marker}_page`, name: `${marker} Page`, blocks: [{ type: 'paragraph' }] }],
      apis: [{ uuid: `${marker}_api`, alias: `${marker} API`, method: 'POST', blocks: [{ functionName: 'create' }] }],
      upgradePlan: {
        processors: [{ functionName: 'trim' }],
        blocks: [{ name: 'MPageState' }],
        actions: [{ action: 'export_file' }],
        controls: [{ type: 'switch_controller' }],
        components: [{}]
      }
    });
    const request = {
      requirementDocument: '  增加批量导出。  ',
      projectContext: { app: 'crm' },
      dslContext: { availableBlocks: ['MAdvanceTable'] },
      generationPreferences: { language: 'zh-CN' }
    };
    const history = [
      { status: 'success', requirementDocument: 'latest', response: response('Latest', 'latest') },
      { status: 'error', requirementDocument: 'failed', response: response('Failed', 'failed') },
      { status: 'success', requirementDocument: 'previous', response: response('Previous', 'previous') },
      { status: 'success', requirementDocument: 'oldest', response: response('Oldest', 'oldest') }
    ];
    const original = JSON.parse(JSON.stringify({ request, history }));
    const payload = applyProcessor(request, {
      processor: 'ai_dsl_request_context',
      param: {
        history,
        historyLimit: 2
      }
    }) as {
      requirementDocument: string;
      dslContext: {
        conversationHistory: Array<{
          requirementDocument: string;
          response: { pages: Array<Record<string, unknown>> };
        }>;
      };
    };
    const appendOrderedPayload = applyProcessor(request, {
      processor: 'ai_dsl_request_context',
      param: {
        history: history.slice().reverse(),
        historyOrder: 'oldest_first',
        historyLimit: 2
      }
    }) as typeof payload;

    return {
      payload,
      appendOrderedHistory: appendOrderedPayload.dslContext.conversationHistory
        .map((turn) => turn.requirementDocument),
      request,
      history,
      original,
      registered: getProcessorDefinition('ai_dsl_request_context')?.supportedTypes,
      promptOrder: {
        previous: payload.requirementDocument.indexOf('previous'),
        latest: payload.requirementDocument.indexOf('latest')
      },
      summarizedPage: payload.dslContext.conversationHistory[0]?.response.pages[0]
    };
  });

  expect(result.registered).toEqual(['object']);
  expect(result.payload.requirementDocument).toContain('这是一次连续对话');
  expect(result.payload.requirementDocument).toContain('增加批量导出。');
  expect(result.promptOrder.previous).toBeGreaterThanOrEqual(0);
  expect(result.promptOrder.previous).toBeLessThan(result.promptOrder.latest);
  expect(result.payload.dslContext).toMatchObject({
    availableBlocks: ['MAdvanceTable'],
    conversationHistory: [
      {
        requirementDocument: 'latest',
        response: {
          status: 'complete',
          summary: 'Latest',
          pages: [{ uuid: 'latest_page', name: 'latest Page' }],
          apis: [{ uuid: 'latest_api', alias: 'latest API', method: 'POST' }],
          upgradePlan: {
            processors: ['trim'],
            blocks: ['MPageState'],
            actions: ['export_file'],
            controls: ['switch_controller'],
            components: ['component_1']
          }
        }
      },
      expect.objectContaining({ requirementDocument: 'previous' })
    ]
  });
  expect(result.appendOrderedHistory).toEqual(['latest', 'previous']);
  expect(result.summarizedPage).not.toHaveProperty('blocks');
  expect(result.request).toEqual(result.original.request);
  expect(result.history).toEqual(result.original.history);
});

test('resolves AI DSL history templates and reports stable request errors', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { resolveActionTemplates } = await import('/src/actions/template.ts');
    const { applyProcessor } = await import('/src/processors/index.ts');
    const history = [{
      status: 'success',
      requirementDocument: '生成客户列表。',
      response: {
        status: 'complete',
        summary: 'Generated',
        pages: [],
        apis: [],
        upgradePlan: {
          processors: [],
          blocks: [],
          actions: [],
          controls: [],
          components: []
        }
      }
    }];
    const resolved = resolveActionTemplates({
      template: "{{actions['read_ai_request'].outputs.returnData}}",
      processors: [{
        processor: 'ai_dsl_request_context',
        param: {
          history: {
            template: "{{blocks['ai-chat-state'].turns}}"
          },
          historyLimit: 5
        }
      }]
    }, {
      actions: {
        read_ai_request: {
          inputs: {},
          outputs: {
            returnData: {
              requirementDocument: '增加客户导出。',
              dslContext: 'legacy-context'
            }
          }
        }
      },
      blocks: {
        'ai-chat-state': { turns: history }
      },
      event: null,
      sourceBlock: { type: 'MButton', data: {} },
      now: '2026-07-12T00:00:00.000Z'
    });
    const readError = (callback: () => unknown) => {
      try {
        callback();
        return null;
      } catch (error) {
        return {
          code: (error as { code?: string }).code,
          processor: (error as { processor?: string }).processor
        };
      }
    };

    return {
      resolved,
      invalidRequest: readError(() => applyProcessor('invalid', 'ai_dsl_request_context')),
      missingRequirement: readError(() => applyProcessor(
        { requirementDocument: '   ' },
        'ai_dsl_request_context'
      )),
      invalidParam: readError(() => applyProcessor(
        { requirementDocument: 'valid' },
        { processor: 'ai_dsl_request_context', param: { historyLimit: -1 } }
      ))
    };
  });

  expect(result.resolved).toMatchObject({
    requirementDocument: expect.stringContaining('增加客户导出。'),
    dslContext: {
      value: 'legacy-context',
      conversationHistory: [
        expect.objectContaining({ requirementDocument: '生成客户列表。' })
      ]
    }
  });
  expect(result.invalidRequest).toEqual({
    code: 'AI_DSL_REQUEST_INVALID',
    processor: 'ai_dsl_request_context'
  });
  expect(result.missingRequirement).toEqual({
    code: 'AI_DSL_REQUIREMENT_MISSING',
    processor: 'ai_dsl_request_context'
  });
  expect(result.invalidParam).toEqual({
    code: 'PROCESSOR_INVALID_CONFIG',
    processor: 'ai_dsl_request_context'
  });
});
