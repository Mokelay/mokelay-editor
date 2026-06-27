import { createApp, defineAsyncComponent, h, type App as VueApp } from 'vue';
import { getPage, getSystemPage } from '@/utils/pagesApi';
import type { PageDataSourceConfig, PageRuntimeContext } from '@/utils/pageRuntimeContext';
import type { OutputData } from '@editorjs/editorjs';

type DialogRequest = {
  title: string;
  pageUUID: string;
  pageSource?: 'user' | 'system';
  context?: PageRuntimeContext;
};

type DialogHandle = {
  close: () => void;
};

const MPage = defineAsyncComponent(() => import('@/blocks/MPage.vue'));

let dialogApp: VueApp<Element> | null = null;
let dialogContainer: HTMLElement | null = null;

function clearDialogHost() {
  dialogApp?.unmount();
  dialogContainer?.remove();
  dialogApp = null;
  dialogContainer = null;
}

export async function showActionPageDialog(request: DialogRequest): Promise<unknown> {
  if (typeof document === 'undefined') {
    return null;
  }

  const page = request.pageSource === 'system'
    ? await getSystemPage(request.pageUUID)
    : await getPage(request.pageUUID);
  clearDialogHost();

  return await new Promise((resolve) => {
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      clearDialogHost();
      resolve(null);
    };

    dialogContainer = document.createElement('div');
    dialogContainer.setAttribute('data-testid', 'action-dialog-host-container');
    document.body.appendChild(dialogContainer);

    dialogApp = createApp({
      setup() {
        const handleKeydown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        };

        return () => h(ActionDialogContent, {
          title: request.title,
          pageId: page.uuid,
          blocks: page.blocks,
          dataSources: page.dataSources,
          runtimeContext: request.context ?? {},
          onClose: close,
          onKeydown: handleKeydown
        });
      }
    });
    dialogApp.mount(dialogContainer);
  });
}

const ActionDialogContent = {
  props: {
    title: {
      type: String,
      required: true
    },
    blocks: {
      type: Array,
      required: true
    },
    dataSources: {
      type: Array,
      required: false,
      default: () => []
    },
    pageId: {
      type: String,
      required: true
    },
    runtimeContext: {
      type: Object,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    },
    onKeydown: {
      type: Function,
      required: true
    }
  },
  setup(props: {
    title: string;
    pageId: string;
    blocks: OutputData['blocks'];
    dataSources?: PageDataSourceConfig[];
    runtimeContext: PageRuntimeContext;
    onClose: DialogHandle['close'];
    onKeydown: (event: KeyboardEvent) => void;
  }) {
    return () => h('div', {
      class: 'action-dialog-overlay',
      'data-testid': 'action-dialog-overlay'
    }, [
      h('section', {
        class: 'action-dialog-panel',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'action-dialog-title',
        tabindex: -1,
        'data-testid': 'action-dialog',
        onKeydown: props.onKeydown
      }, [
        h('div', { class: 'action-dialog-header' }, [
          h('h2', {
            id: 'action-dialog-title',
            class: 'action-dialog-title',
            'data-testid': 'action-dialog-title'
          }, props.title),
          h('button', {
            type: 'button',
            class: 'action-dialog-close',
            'data-testid': 'action-dialog-close',
            onClick: props.onClose
          }, 'Close')
        ]),
        h('div', {
          class: 'action-dialog-body',
          'data-testid': 'action-dialog-body'
        }, [
          h(MPage, {
            edit: false,
            value: props.blocks,
            pageId: props.pageId,
            dataSources: props.dataSources,
            runtimeContext: props.runtimeContext,
            onClose: props.onClose
          })
        ])
      ])
    ]);
  }
};
