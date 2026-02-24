<script setup lang="ts">
import type { Album } from '~/types/api';
import {
  addFavorite,
  fetchAlbumBySlug,
  fetchFavoriteById,
  fetchRatingById,
  removeFavorite,
  saveRating,
} from '~/service/api';
import spotifyLogo from '~/assets/icons/spotify-logo.svg';

definePageMeta({
  title: 'Album detail'
});

const route = useRoute();
const { isAuthed } = useAuth();

const showLoginDialog = ref(false);
const isFavoriteLoading = ref(false);
const isFavorited = ref(false);
const isRatingLoading = ref(false);
const isRated = ref(false);
const showRatingDialog = ref(false);
const savedRatingScore = ref(0);
const savedRatingReview = ref('');
const draftRatingScore = ref(0);
const draftRatingReview = ref('');

const slug = computed(() => route.params.slug as string);
const genres = computed(() => album.value?.genres ?? []);
const tracks = computed(() => album.value?.tracks ?? []);
const releaseYear = computed(() => album.value?.releaseDate.slice(0, 4));
const ratingLabel = computed(() => isRated.value ? `${savedRatingScore.value}/5` : 'Not rated');

const { data: album } = useAsyncData<Album>(() => fetchAlbumBySlug(slug.value), { watch: [slug] });

watch([() => album.value?.id, () => isAuthed.value], loadUserMeta, { immediate: true });

async function loadUserMeta() {
  if (!album.value) return;
  if (!isAuthed.value) {
    isFavorited.value = false;
    isRated.value = false;
    savedRatingScore.value = 0;
    savedRatingReview.value = '';
    draftRatingScore.value = 0;
    draftRatingReview.value = '';
    return;
  }

  isFavoriteLoading.value = true;
  isRatingLoading.value = true;
  try {
    const albumId = album.value.id;
    const [favoriteResult, ratingResult] = await Promise.allSettled([
      fetchFavoriteById(albumId),
      fetchRatingById(albumId),
    ]);

    if (favoriteResult.status === 'fulfilled') {
      isFavorited.value = favoriteResult.value.isFavorited;
    } else {
      isFavorited.value = false;
    }

    if (ratingResult.status === 'fulfilled') {
      isRated.value = ratingResult.value.isRated;
      savedRatingScore.value = ratingResult.value.rating?.score ?? 0;
      savedRatingReview.value = ratingResult.value.rating?.review ?? '';
      draftRatingScore.value = savedRatingScore.value;
      draftRatingReview.value = savedRatingReview.value;
    } else {
      isRated.value = false;
      savedRatingScore.value = 0;
      savedRatingReview.value = '';
      draftRatingScore.value = 0;
      draftRatingReview.value = '';
    }
  } finally {
    isFavoriteLoading.value = false;
    isRatingLoading.value = false;
  }
}

async function toggleFavorite() {
  if (!album.value) return;

  if (!isAuthed.value) {
    showLoginDialog.value = true;
    return;
  }

  isFavoriteLoading.value = true;
  try {
    if (isFavorited.value) {
      await removeFavorite(album.value.id);
      isFavorited.value = false;
    } else {
      await addFavorite(album.value.id);
      isFavorited.value = true;
    }
  } catch {
    isFavorited.value = !isFavorited.value; // rollback
  } finally {
    isFavoriteLoading.value = false;
  }
}

function openRatingDialog() {
  if (!album.value) return;

  if (!isAuthed.value) {
    showLoginDialog.value = true;
    return;
  }

  draftRatingScore.value = savedRatingScore.value;
  draftRatingReview.value = savedRatingReview.value;
  showRatingDialog.value = true;
}

async function saveAlbumRating() {
  if (!album.value) return;
  if (!isAuthed.value) {
    showLoginDialog.value = true;
    return;
  }
  if (!draftRatingScore.value) return;

  isRatingLoading.value = true;
  try {
    const review = draftRatingReview.value.trim() || null;
    await saveRating(album.value.id, {
      score: draftRatingScore.value,
      review,
    });
    isRated.value = true;
    savedRatingScore.value = draftRatingScore.value;
    savedRatingReview.value = review ?? '';
    showRatingDialog.value = false;
  } finally {
    isRatingLoading.value = false;
  }
}
</script>

<template>
  <section>
    <div
      v-if="album"
      class="space-y-6"
    >
      <div class="flex flex-wrap items-start justify-start gap-4">
        <NuxtImg
          v-if="album.coverUrl"
          :src="album.coverUrl"
          alt="Album cover"
          class="w-60 aspect-square rounded-xl object-cover"
        />

        <div class="flex flex-col gap-2">
          <p class="text-primary uppercase tracking-wide">{{ album.artistName }}</p>
          <h1 class="text-3xl font-semibold">{{ album.title }}</h1>
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <Tag :value="releaseYear" rounded />
            <Tag
              v-for="genre in genres"
              :key="genre.id ?? genre.slug"
              :value="genre.name"
              rounded
            />
          </div>

          <div class="flex gap-2">
            <Button
              v-if="album.spotifyId"
              size="small"
              severity="contrast"
              text
              as="a"
              :href="`https://open.spotify.com/album/${album.spotifyId}`"
              target="_blank"
            >
              <NuxtImg
                :src="spotifyLogo"
                alt=""
                width="24"
              />
            </Button>
          </div>

          <div>
            <Button
              :loading="isFavoriteLoading"
              :icon="isFavorited ? 'pi pi-heart-fill' : 'pi pi-heart'"
              text
              raised
              rounded
              size="small"
              aria-label="Toggle Favorite"
              @click="toggleFavorite"
            />

            <div class="mt-3 flex flex-wrap items-center gap-3">
              <Button
                :loading="isRatingLoading"
                :label="isRated ? 'Edit rating' : 'Rate album'"
                icon="pi pi-star"
                text
                rounded
                size="small"
                aria-label="Rate album"
                @click="openRatingDialog"
              />

              <div class="flex items-center gap-2 text-sm text-slate-500">
                <Rating :model-value="savedRatingScore" readonly :cancel="false" />
                <span>{{ ratingLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <Panel v-if="album.description" header="Description" toggleable>
          <template #icons>
            <Button
              v-if="album.wikiUrl"
              as="a"
              label="Wikipedia"
              icon="pi pi-external-link"
              size="small"
              severity="contrast"
              link
              :href="album.wikiUrl"
              target="_blank"
            />
          </template>
          <p class="m-0">{{ album.description }}</p>
        </Panel>

        <AlbumTracklist
          v-if="tracks.length"
          :tracks="tracks"
          :duration-ms="album.durationMs"
        />
      </div>
    </div>

    <LoginRequiredDialog v-model:visible="showLoginDialog" />

    <AlbumRatingDialog
      v-model:visible="showRatingDialog"
      v-model:score="draftRatingScore"
      v-model:review="draftRatingReview"
      :loading="isRatingLoading"
      @save="saveAlbumRating"
    />
  </section>
</template>
