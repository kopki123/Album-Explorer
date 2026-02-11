<script setup lang="ts">
import type { Track } from '../types/api';
import { formatDurationMs } from '../utils/format';

const props = withDefaults(defineProps<{
  tracks: Track[];
  durationMs?: number | null;
}>(), {
  durationMs: null
});

const durationLabel = computed(() => formatDurationMs(props.durationMs));
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-slate-500">Tracklist</p>
        <p class="font-semibold">{{ tracks.length }} songs</p>
      </div>
      <Tag
        v-if="durationLabel"
        :value="`Total Length ${durationLabel}`"
        rounded
      />
    </div>

    <DataTable :value="tracks" size="small">
      <Column header="#" field="trackNo" />
      <Column header="Title" field="title" />
      <Column header="Duration">
        <template #body="{ data }">
          {{ formatDurationMs(data.durationMs) || '—' }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
