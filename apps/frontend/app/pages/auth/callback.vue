<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Authenticating...'
});

const { refreshSession } = useAuth();

const status = ref<'loading' | 'error'>('loading');

onMounted(async () => {
  const token = await refreshSession();

  if (token) {
    navigateTo('/albums');
  } else {
    status.value = 'error';
  }
});
</script>

<template>
  <section class="max-w-xl mx-auto p-6 text-center">
    <div
      v-if="status === 'loading'"
      class="space-y-4"
    >
      <ProgressSpinner />
      <p class="text-lg font-semibold">Signing you in...</p>
      <p class="text-slate-500">Refreshing your session with Google.</p>
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <i class="pi pi-times-circle text-3xl text-red-500" />
      <p class="text-lg font-semibold">Login failed</p>
      <p class="text-slate-500">We could not refresh your session. Try logging in again.</p>
      <Button
        label="Back to albums"
        @click="navigateTo('/albums')"
      />
    </div>
  </section>
</template>
