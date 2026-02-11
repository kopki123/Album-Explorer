<script setup lang="ts">
const props = withDefaults(defineProps<{
  loading?: boolean;
}>(), {
  loading: false
});

const emit = defineEmits<{
  (event: 'save'): void;
}>();

const dialogVisible = defineModel<boolean>('visible');
const score = defineModel<number>('score');
const review = defineModel<string>('review');
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :draggable="false"
    header="Rate album"
    :style="{ width: '24rem' }"
  >
    <div class="flex flex-col gap-4">
      <Rating v-model="score" />

      <Textarea
        v-model="review"
        placeholder="Add a short note (optional)"
        auto-resize
        :rows="4"
      />
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          size="small"
          severity="secondary"
          text
          @click="dialogVisible = false"
        />
        <Button
          :loading="props.loading"
          label="Save rating"
          size="small"
          outlined
          @click="emit('save')"
        />
      </div>
    </template>
  </Dialog>
</template>
