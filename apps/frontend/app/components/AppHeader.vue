<script setup lang="ts">
const { isAuthed, user, logout } = useAuth();

const accountMenuItems = [
  { label: 'Profile', icon: 'pi pi-user', command: () => navigateTo('/me') },
  { label: 'Logout', icon: 'pi pi-sign-out', command: logout },
];

const accountMenu = ref();

function toggleAccountMenu(event: Event) {
  accountMenu.value?.toggle(event);
}
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-slate-200">
    <div class="max-w-6xl mx-auto flex items-center justify-between gap-2 p-4">
      <AppLogo />

      <div
        v-if="isAuthed"
        class="flex items-center"
      >
        <Avatar
          :image="user?.avatarUrl || ''"
          shape="circle"
          aria-label="avatar"
          aria-haspopup="true"
          aria-controls="account_menu"
          class="cursor-pointer"
          @click="toggleAccountMenu"
        />
        <Menu
          id="account_menu"
          ref="accountMenu"
          :model="accountMenuItems"
          popup
        />
      </div>

      <GoogleLoginButton v-else />
    </div>
  </header>
</template>
