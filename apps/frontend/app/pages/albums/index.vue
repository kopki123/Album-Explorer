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
  { label: 'Title A-Z', value: 'title_asc' },
];

const searchTerm = ref((route.query.q as string) || '');
const sort = ref((route.query.sort as string) || '');
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(Number(route.query.pageSize) || 10);

const randomLoading = ref(false);

watch(searchTerm, () => page.value = 1, { immediate: true });

watch([searchTerm, sort, page], () => {
  router.replace({
    query: {
      q: searchTerm.value || undefined,
      sort: sort.value ,
      page: page.value !== 1 ? page.value.toString() : undefined
    }
  });
});

const { data: albums } = useAsyncData<PaginatedResponse<Album>>('albums-explore', () =>
  fetchAlbums({
    q: searchTerm.value || undefined,
    sort: sort.value || undefined,
    page: page.value,
    pageSize: pageSize.value
  }),
  { watch: [searchTerm, sort, page, pageSize] }
);

function goToAlbum(slug: string) {
  navigateTo(`/albums/${slug}`);
}

async function goRandom() {
  const randomAlbum = await fetchRandomAlbum();
  goToAlbum(randomAlbum.slug);
}
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
      <div
        v-if="albums?.items?.length"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AlbumCard
          v-for="album in albums.items"
          :key="album.id"
          :album="album"
          @open="goToAlbum"
        />
      </div>

      <p v-else class="py-12 text-center text-slate-500">
        No albums found for this search. Try another keyword.
      </p>
    </div>
  </section>
</template>
