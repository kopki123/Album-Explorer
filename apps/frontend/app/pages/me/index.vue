<script setup lang="ts">
definePageMeta({
  title: 'My Library'
});

const { isAuthed } = useAuth();
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-3xl font-semibold">Your albums</h1>
    <p class="text-slate-500">Favorites and ratings albums.</p>

    <div
      v-if="!isAuthed"
      class="flex flex-col items-center gap-3 px-6 py-10 text-center"
    >
      <i class="pi pi-lock text-3xl text-primary-300" />
      <p class="text-lg font-semibold">Sign in to view your library</p>
      <p class="text-slate-500">Continue with Google to load your saved albums and scores.</p>
    </div>

    <Tabs
      v-else
      lazy
      value="favorites"
    >
      <TabList>
        <Tab value="favorites">Favorites</Tab>
        <Tab value="ratings">Ratings</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="favorites">
          <UserFavoritesList />
        </TabPanel>
        <TabPanel value="ratings">
          <UserRatingsList />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </section>
</template>
