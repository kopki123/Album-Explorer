<script setup lang="ts">
import type { PaginatedResponse, RatingItem } from '~/types/api';
import { fetchRatings } from '~/service/api';
import { formatDate } from '~/utils/format';

interface PageEvent {
  page: number;
  rows: number;
}

const { isAuthed } = useAuth();

const sortOptions = [
  { label: 'Recently updated', value: 'updatedAt_desc' },
  { label: 'Highest rated', value: 'score_desc' },
  { label: 'Lowest rated', value: 'score_asc' },
  { label: 'Oldest rated', value: 'createdAt_asc' },
];

const page = ref(1);
const pageSize = ref(10);
const sort = ref(sortOptions[0]?.value);

const items = computed(() => data.value?.items ?? []);
const total = computed(() => data.value?.pagination?.total ?? 0);
const first = computed(() => (page.value - 1) * pageSize.value);
const showPaginator = computed(() => total.value > pageSize.value);
const itemsWithTimestamp = computed(() => {
  return items.value.map((item) => {
    const isUpdated = item.updatedAt && item.updatedAt !== item.createdAt;
    const label = isUpdated ? 'Updated' : 'Rated';
    const timestamp = isUpdated ? item.updatedAt : item.createdAt;

    return {
      ...item,
      ratingTimestamp: `${label} ${formatDate(timestamp)}`
    };
  });
});

watch(sort, () => page.value = 1);

const { data, pending, error } = useAsyncData<PaginatedResponse<RatingItem>>('me-ratings',
  () => {
    return fetchRatings({
      page: page.value,
      pageSize: pageSize.value,
      sort: sort.value
    });
  },
  { watch: [isAuthed, page, pageSize, sort] }
);

function handlePage(event: PageEvent) {
  page.value = event.page + 1;
  pageSize.value = event.rows;
}

function goToAlbum(slug: string) {
  navigateTo(`/albums/${slug}`);
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-start justify-end">
      <Select
        v-model="sort"
        :options="sortOptions"
        option-label="label"
        option-value="value"
        placeholder="Sort"
      />
    </div>

    <div
      v-if="pending"
      class="flex justify-center py-10"
    >
      <ProgressSpinner />
    </div>

    <div
      v-if="error"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
    >
      Could not load ratings. Try again later.
    </div>

    <div
      v-if="!itemsWithTimestamp.length"
      class="py-12 text-center text-slate-500"
    >
      No ratings yet. Add a score from any album page.
    </div>

    <div
      v-if="itemsWithTimestamp.length"
      class="grid gap-4 lg:grid-cols-2"
    >
      <Card
        v-for="item in itemsWithTimestamp"
        :key="item.album.id"
        class="cursor-pointer transition hover:shadow-md"
        @click="goToAlbum(item.album.slug)"
      >
        <template #content>
          <div class="flex gap-4">
            <div class="shrink-0">
              <NuxtImg
                v-if="item.album.coverUrl"
                :src="item.album.coverUrl"
                :alt="item.album.title"
                class="w-24 h-24 rounded-lg object-cover"
              />
              <div
                v-else
                class="flex items-center justify-center w-24 h-24 rounded-lg bg-slate-100 text-slate-500"
              >
                <i class="pi pi-image" />
              </div>
            </div>

            <div class="flex flex-1 flex-col gap-3">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p class="text-sm text-slate-500">{{ item.album.artistName }}</p>
                  <h3 class="text-lg font-semibold">{{ item.album.title }}</h3>
                </div>
                <Tag
                  :value="`${item.score}/5`"
                  rounded
                />
              </div>

              <div class="flex items-center gap-3">
                <Rating
                  :model-value="item.score"
                  readonly
                />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Paginator
      v-if="showPaginator"
      :rows="pageSize"
      :total-records="total"
      :first="first"
      @page="handlePage"
    />
  </section>
</template>
