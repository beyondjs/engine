<script lang="ts">
    import Header from './header.svelte';
    import {title} from './model';
</script>

<div class="page__container">
    <Header title="{title}"/>
</div>

<style lang="scss">
  .page__container {
    display: flex;
    padding: 20px;
    margin: 5px auto;
    flex-direction: row;
    background: var(--bg-element);
  }
</style>