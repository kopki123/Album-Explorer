<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />

    <main class="flex-1">
      <div class="w-full max-w-6xl mx-auto px-4 py-8">
        <slot />
      </div>
    </main>

    <AppFooter />
  </div>
</template>
