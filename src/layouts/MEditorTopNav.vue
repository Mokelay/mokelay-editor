<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import TopNavAction from '@/layouts/TopNavAction.vue';
import type { LayoutMenuItem } from '@/utils/layoutsApi';
import type { TopNavProps } from '@/layouts/topNavTypes';
import {
  controlLabel,
  controlValue,
  getActionHref,
  getActionLabel,
  getMenuItemBadge,
  getVisibleTopNavActions,
  handleControlChange,
  normalizeHref
} from '@/layouts/topNavRuntime';

defineOptions({
  name: 'MEditorTopNav'
});

const props = withDefaults(defineProps<TopNavProps>(), {
  variant: 'editor',
  brand: () => ({ text: 'Mokelay Editor', href: '#/', showMark: false }),
  homeAction: undefined,
  utilityControls: () => [],
  items: () => [],
  actions: () => [],
  guestActions: () => [],
  userActions: () => [],
  auth: () => ({ loggedIn: false, user: null, pending: false })
});

const visibleActions = computed(() => getVisibleTopNavActions(props));
const brandText = computed(() => props.brand?.text?.trim() || 'Mokelay Editor');
const brandHref = computed(() => normalizeHref(props.brand?.href || '#/'));
const showBrandMark = computed(() => props.brand?.showMark === true);
const currentHash = ref(readCurrentHash());

function readCurrentHash() {
  if (typeof window === 'undefined') return '#/';
  return normalizeHashPath(window.location.hash || '#/');
}

function syncCurrentHash() {
  currentHash.value = readCurrentHash();
}

function normalizeHashPath(value: string) {
  const [path] = value.split('?', 1);
  const normalized = path.replace(/\/+$/, '');
  if (normalized === '#') return '#/';
  return normalized || '#/';
}

function normalizeItemHash(item: LayoutMenuItem) {
  const href = normalizeHref(item.href);
  if (!href.startsWith('#/')) return '';
  return normalizeHashPath(href);
}

function isActiveItem(item: LayoutMenuItem) {
  const itemHash = normalizeItemHash(item);
  if (!itemHash) return item.active === true;
  const activeHash = currentHash.value;
  if (itemHash === '#/') return activeHash === '#/';
  return activeHash === itemHash || activeHash.startsWith(`${itemHash}/`);
}

onMounted(() => {
  window.addEventListener('hashchange', syncCurrentHash);
  window.addEventListener('popstate', syncCurrentHash);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', syncCurrentHash);
  window.removeEventListener('popstate', syncCurrentHash);
});
</script>

<template>
  <header data-testid="layout-top-nav" class="layout-top-nav layout-top-nav--editor">
    <div class="layout-top-nav__left">
      <a class="layout-top-nav__brand" :href="brandHref">
        <span v-if="showBrandMark" class="layout-top-nav__mark">{{ brandText.slice(0, 1).toUpperCase() }}</span>
        <span>{{ brandText }}</span>
      </a>

      <a
        v-if="homeAction"
        class="layout-top-nav__home"
        :href="getActionHref(homeAction) || '#'"
      >
        {{ getActionLabel(homeAction) }}
      </a>
    </div>

    <div class="layout-top-nav__right">
      <div v-if="utilityControls.length" class="layout-top-nav__controls">
        <label
          v-for="control in utilityControls"
          :key="control.id || control.label || control.value"
          class="layout-top-nav__control"
        >
          <span class="layout-top-nav__control-label">{{ controlLabel(control) }}</span>
          <select
            class="layout-top-nav__select"
            :value="controlValue(control)"
            :aria-label="controlLabel(control)"
            :data-testid="control.id ? `layout-top-nav-control-${control.id}` : undefined"
            @change="handleControlChange(control, ($event.target as HTMLSelectElement).value)"
          >
            <option
              v-for="option in control.options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>

      <nav class="layout-top-nav__links" aria-label="Main navigation">
        <a
          v-for="item in items"
          :key="`${item.label}-${item.href}`"
          class="layout-top-nav__link"
          :class="{ 'layout-top-nav__link--active': isActiveItem(item) }"
          :href="normalizeHref(item.href)"
        >
          <span class="layout-top-nav__link-text">{{ item.label }}</span>
          <span v-if="getMenuItemBadge(item)" class="layout-top-nav__link-badge">{{ getMenuItemBadge(item) }}</span>
        </a>
      </nav>

      <div class="layout-top-nav__actions">
        <TopNavAction
          v-for="action in visibleActions"
          :key="action.id || `${action.type}-${getActionLabel(action)}`"
          :action="action"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.layout-top-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: space-between;
  min-height: 64px;
  border: 1px solid rgb(226 232 240);
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgb(15 23 42 / 0.08);
  margin: 0;
  padding: 12px 16px;
}

.layout-top-nav__left,
.layout-top-nav__right,
.layout-top-nav__brand,
.layout-top-nav__links,
.layout-top-nav__actions,
.layout-top-nav__controls {
  display: flex;
  align-items: center;
}

.layout-top-nav__left {
  flex: none;
  gap: 14px;
}

.layout-top-nav__right {
  min-width: 0;
  flex: 1;
  gap: 12px;
  justify-content: flex-end;
}

.layout-top-nav__brand {
  flex: none;
  gap: 10px;
  color: rgb(15 23 42);
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  text-decoration: none;
}

.layout-top-nav__mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 8px;
  background: rgb(15 118 110);
  color: white;
}

.layout-top-nav__home,
.layout-top-nav__select,
.layout-top-nav__action {
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  padding: 6px 12px;
}

.layout-top-nav__home {
  flex: none;
  border: 1px solid rgb(203 213 225);
  background: white;
  color: rgb(51 65 85);
  text-decoration: none;
}

.layout-top-nav__controls {
  flex: none;
  gap: 8px;
}

.layout-top-nav__control {
  display: flex;
  align-items: center;
}

.layout-top-nav__control-label {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.layout-top-nav__select {
  min-width: 88px;
  border: 1px solid rgb(203 213 225);
  background: white;
  color: rgb(51 65 85);
  padding-right: 32px;
}

.layout-top-nav__links {
  min-width: 0;
  flex: none;
  justify-content: center;
  border-radius: 8px;
  background: rgb(241 245 249);
  gap: 2px;
  overflow-x: auto;
  padding: 4px;
}

.layout-top-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  border-radius: 6px;
  color: rgb(71 85 105);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  padding: 6px 12px;
  text-decoration: none;
}

.layout-top-nav__link-badge {
  flex: none;
  color: rgb(239 68 68);
  font-size: 12px;
  line-height: 1;
}

.layout-top-nav__link--active,
.layout-top-nav__link:hover {
  background: white;
  color: rgb(15 23 42);
  box-shadow: 0 1px 4px rgb(15 23 42 / 0.08);
}

.layout-top-nav__actions {
  flex: none;
  gap: 8px;
}

.layout-top-nav__action {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
}

.layout-top-nav__action-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.layout-top-nav__action-icon {
  width: 16px;
  height: 16px;
  flex: none;
}

.layout-top-nav__action-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  display: grid;
  min-width: 16px;
  height: 16px;
  place-items: center;
  border-radius: 999px;
  background: rgb(239 68 68);
  color: white;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  padding: 0 4px;
}

.layout-top-nav__avatar {
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 74% 24%, rgb(255 255 255 / 0.95), transparent 16%),
    conic-gradient(from 210deg, rgb(36 99 235), rgb(6 182 212), rgb(168 85 247), rgb(36 99 235));
}

.layout-top-nav__action--shape-icon,
.layout-top-nav__action--shape-avatar {
  width: 36px;
  height: 36px;
  padding: 0;
}

.layout-top-nav__action--primary {
  border-color: rgb(79 70 229);
  background: rgb(79 70 229);
  color: white;
}

.layout-top-nav__action--teal {
  border-color: rgb(15 118 110);
  background: rgb(15 118 110);
  color: white;
}

.layout-top-nav__action--success {
  border-color: rgb(16 185 129);
  background: rgb(16 185 129);
  color: white;
}

.layout-top-nav__action--secondary {
  border-color: rgb(203 213 225);
  background: white;
  color: rgb(15 23 42);
}

.layout-top-nav__action--ghost {
  color: rgb(51 65 85);
}

.dark .layout-top-nav {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42);
}

.dark .layout-top-nav__brand {
  color: rgb(248 250 252);
}

.dark .layout-top-nav__home,
.dark .layout-top-nav__select {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .layout-top-nav__links {
  background: rgb(30 41 59);
}

.dark .layout-top-nav__link {
  color: rgb(203 213 225);
}

.dark .layout-top-nav__link--active,
.dark .layout-top-nav__link:hover {
  background: rgb(15 23 42);
  color: rgb(248 250 252);
}

.dark .layout-top-nav__action--secondary {
  border-color: rgb(71 85 105);
  background: rgb(15 23 42);
  color: rgb(226 232 240);
}

.dark .layout-top-nav__action--ghost {
  color: rgb(203 213 225);
}

@media (max-width: 720px) {
  .layout-top-nav {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .layout-top-nav__right {
    align-items: stretch;
    flex-direction: column;
  }

  .layout-top-nav__links {
    justify-content: flex-start;
  }

  .layout-top-nav__controls,
  .layout-top-nav__actions {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>
