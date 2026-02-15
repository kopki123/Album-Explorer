<script setup lang="ts">
import type { Album, PaginatedResponse } from '../../types/api';
import { fetchAlbums, fetchRandomAlbum } from '../../service/api';

definePageMeta({
  title: 'Explore albums'
});

const route = useRoute();
const router = useRouter();

const sortOptions = [
  { label: 'Oldest Releases', value: 'releaseDate_asc' },
  { label: 'Newest Releases', value: 'releaseDate_desc' },
];

const searchTerm = ref((route.query.q as string) || '');
const sort = ref((route.query.sort as string) || '');
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(Number(route.query.pageSize) || 10);

const randomLoading = ref(false);

watch([searchTerm, sort, pageSize], () => page.value = 1, { immediate: true });

watch([searchTerm, sort, page], () => {
  router.replace({
    query: {
      q: searchTerm.value || undefined,
      sort: sort.value ,
      page: page.value !== 1 ? page.value.toString() : undefined
    }
  });
});

const albumItems = ref<Album[]>([]);
const totalAlbums = ref(0);
const columns = ref(1);

const { data: albums, pending } = useAsyncData<PaginatedResponse<Album>>('albums-explore', () =>
  fetchAlbums({
    q: searchTerm.value || undefined,
    sort: sort.value || undefined,
    page: page.value,
    pageSize: pageSize.value
  }),
  { watch: [searchTerm, sort, page, pageSize] }
);

watch([searchTerm, sort, pageSize], () => {
  albumItems.value = [];
});

watch(albums, (value) => {
  if (!value) return;

  totalAlbums.value = value.pagination.total;

  if (page.value === 1) {
    albumItems.value = value.items;
    return;
  }

  albumItems.value = [...albumItems.value, ...value.items];
}, { immediate: true });

const hasMoreAlbums = computed(() => albumItems.value.length < totalAlbums.value);
const albumRows = computed(() => {
  const rows: Album[][] = [];

  for (let i = 0; i < albumItems.value.length; i += columns.value) {
    rows.push(albumItems.value.slice(i, i + columns.value));
  }

  return rows;
});

function updateColumns() {
  if (window.innerWidth >= 1280) {
    columns.value = 3;
    return;
  }

  if (window.innerWidth >= 768) {
    columns.value = 2;
    return;
  }

  columns.value = 1;
}

function handleScrollIndexChange({ last }: { first: number; last: number }) {
  if (pending.value || !hasMoreAlbums.value) return;
  if (last >= albumRows.value.length - 2) {
    page.value += 1;
  }
}

function goToAlbum(slug: string) {
  navigateTo(`/albums/${slug}`);
}

async function goRandom() {
  const randomAlbum = await fetchRandomAlbum();
  goToAlbum(randomAlbum.slug);
}

onMounted(() => {
  updateColumns();
  window.addEventListener('resize', updateColumns);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateColumns);
});
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="space-y-4">
        <h1 class="text-3xl font-semibold">Albums to explore</h1>
        <p class="text-slate-500">Search by title or artist, sort your list, and jump to a random gem.</p>
      </div>
      <Button
        :loading="randomLoading"
        label="Random album"
        icon="pi pi-refresh"
        size="small"
        outlined
        @click="goRandom"
      />
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <Select
        v-model="sort"
        :options="sortOptions"
        option-label="label"
        option-value="value"
        placeholder="Sort by"
      />
      <InputText
        v-model="searchTerm"
        placeholder="Search albums or artists"
      />
    </div>

    <div>
      <VirtualScroller
        v-if="albumItems.length"
        :items="albumRows"
        :itemSize="520"
        scrollHeight="75vh"
        class="w-full"
        @scroll-index-change="handleScrollIndexChange"
      >
        <template #item="{ item }">
          <div class="pb-4">
            <div
              class="grid gap-4"
              :class="{
                'grid-cols-1': columns === 1,
                'grid-cols-2': columns === 2,
                'grid-cols-3': columns === 3
              }"
            >
              <AlbumCard
                v-for="album in item"
                :key="album.id"
                :album="album"
                @open="goToAlbum"
              />
            </div>
          </div>
        </template>
      </VirtualScroller>

      <p v-else-if="!pending" class="py-12 text-center text-slate-500">
        No albums found for this search. Try another keyword.
      </p>

      <p v-if="pending && albumItems.length" class="py-2 text-center text-sm text-slate-500">
        Loading more albums...
      </p>
    </div>
  </section>
</template>
