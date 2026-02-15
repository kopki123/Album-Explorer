<script setup lang="ts">
import { fetchMe } from './service/api';
import OgImage from '~/assets/images/og-image.png';

useSeoMeta({
  title: 'Album Explorer',
  ogTitle: 'Album Explorer',
  description: 'Explore and collect your favorite albums.',
  ogDescription: 'Explore and collect your favorite albums.',
  ogImage: OgImage,
  twitterCard: 'summary_large_image',
})

const { accessToken, setSession } = useAuth();

onMounted(async () => {
  const me = await fetchMe();

  setSession(accessToken.value, me);
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
