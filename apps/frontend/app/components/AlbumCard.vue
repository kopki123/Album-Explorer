<script setup lang="ts">
import type { Album } from '~/types/api';
import { formatDurationMs } from '~/utils/format';

const props = defineProps<{
  album: Album;
}>();

const emit = defineEmits<{
  (e: 'open', slug: string): void;
}>();

const releaseYear = props.album.releaseDate.slice(0, 4);
const durationLabel = formatDurationMs(props.album.durationMs) ?? '—';

function handleOpen() {
  emit('open', props.album.slug);
}
</script>

<template>
  <Card
    class="cursor-pointer transition hover:shadow-md"
    @click="handleOpen"
  >
    <template #content>
      <div class="flex flex-col gap-2">
        <LazyNuxtImg
          v-if="album.coverUrl"
          :src="album.coverUrl"
          :alt="album.title"
          class="w-full aspect-square object-cover rounded-xl"
        />
        <p class="text-sm tracking-wide">{{ album.artistName }}</p>
        <h3 class="text-xl font-semibold">{{ album.title }}</h3>
        <div class="flex flex-wrap gap-2">
          <Tag :value="releaseYear" rounded />
          <Tag :value="durationLabel" rounded />
          <Tag
            v-for="genre in album.genres"
            :key="genre.id"
            :value="genre.name"
            rounded
          />
        </div>
      </div>
    </template>
  </Card>
</template>
