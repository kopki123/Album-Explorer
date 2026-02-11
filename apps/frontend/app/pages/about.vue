<script setup lang="ts">
definePageMeta({
  title: 'About'
});

const sections = [
  {
    title: 'Tech',
    items: [
      'Nuxt 4 + TypeScript',
      'PrimeVue components with Tailwind styling',
      'JWT access tokens with refresh cookies'
    ]
  },
  {
    title: 'Features',
    items: [
      'Explore albums by search, sort, and random picks',
      'Slug-based routes like /albums/your-album',
      'Favorites and 1-5 ratings saved to your library'
    ]
  }
];
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-3xl font-semibold">About Album Explorer</h1>

    <p class="text-slate-500">
      Album Explorer is a Nuxt-powered front-end for digging into albums, finding random picks, and saving
      what you love. Sign in with Google to sync favorites and ratings with the backend API.
    </p>

    <div class="grid sm:grid-cols-2 gap-4">
      <Card v-for="section in sections" :key="section.title">
        <template #title>
          <p class="text-sm uppercase tracking-wide text-primary">{{ section.title }}</p>
        </template>
        <template #content>
          <ul class="mt-2 list-inside list-disc space-y-1">
            <li v-for="item in section.items" :key="item">{{ item }}</li>
          </ul>
        </template>
      </Card>
    </div>
  </section>
</template>
