<script setup lang="ts">
import googleIconUrl from '~/assets/icons/google.svg';

const { startGoogleLogin } = useAuth();
</script>

<template>
  <Button
    raised
    outlined
    rounded
    severity="contrast"
    size="small"
    @click="startGoogleLogin"
  >
    <img
      :src="googleIconUrl"
      alt="google"
      class="w-5 h-5"
    />
    <span>Sign in with Google</span>
  </Button>
</template>
