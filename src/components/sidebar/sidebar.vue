<template>
  <div class="sidebar fixed z-[500] top-0 left-0 w-[200px] h-svh py-4 border-r border-solid border-[#e9ecef] bg-[#f8f9fa]">
    <div class="sidebar-header mb-4 border-b border-solid border-[#e9ecef]">
      <h3>Keyp</h3>
    </div>
    <nav class="sidebar-nav">
      <div class="w-full px-2">
        <div @click="store.modals.newAccount.open = !store.modals.newAccount.open" class="btn-item">Aggiungi account</div>
      </div>
      <div class="w-full mt-4 flex flex-col gap-2">
        <RouterLink to="/vault" class="nav-item">🔐 Vault</RouterLink>
        <RouterLink to="/vault" class="nav-item">⚙️ Settings</RouterLink>
      </div>
    </nav>
  </div>
</template>

<script>
import { store } from '../../data/store';

export default {
  name: 'sidebar',
  data() {
    return {
      store,
    };
  },
};
</script>

<style scoped>
.sidebar-header {
  padding: 0 1rem 1rem 1rem;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.btn-item,
.nav-item {
  display: block;
  padding: 0.75rem 1rem;
  color: #666;
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn-item {
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.nav-item:hover {
  background-color: #e9ecef;
  color: #333;
}

.nav-item.router-link-active {
  background-color: #007bff;
  color: white;
}
</style>
