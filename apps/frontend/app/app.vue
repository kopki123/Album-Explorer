<script setup lang="ts">
import { fetchMe } from './service/api';

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
