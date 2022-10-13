<template>
  <div id="body" class="page__container">
    <h1>My first page using BeyondJS with <span class="text">Vue</span>!</h1>
  </div>
</template>

<script lang="ts">
export default {
  name: "page"
}
</script>

<style scoped>
.page__container {
  display: flex;
  padding: 20px;
  margin: 5px auto;
  flex-direction: row;
  background: var(--bg-element);
}

.text {
  color: var(--accent-color);
}
</style>