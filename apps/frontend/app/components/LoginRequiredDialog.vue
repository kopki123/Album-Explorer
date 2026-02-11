<script setup lang="ts">
const visible = defineModel<boolean>('visible', { required: true });

function handleClose() {
  visible.value = false;
}
</script>

<template>
  <Dialog
    modal
    :draggable="false"
    v-model:visible="visible"
    header="Login required"
    :style="{ maxWidth: '24rem' }"
  >
    <p>Sign in to save albums and leave ratings.</p>

    <div class="mt-6 flex justify-end gap-2">
      <Button
        label="Not now"
        size="small"
        text
        severity="secondary"
        @click="handleClose"
      />

      <GoogleLoginButton />
    </div>
  </Dialog>
</template>
