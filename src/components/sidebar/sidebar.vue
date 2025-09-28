<template>
  <div @click="toggleSidebar" class="sidebar fixed z-[500] top-0 left-0 h-svh flex flex-col" :class="{ 'sidebar-open': store.sidebar.open }">
    <div class="w-full h-full flex flex-col justify-between gap-11">
      <div class="w-full">
        <div class="w-full pb-11 flex items-center justify-between">
          <RouterLink @click.stop to="/vault">
            <img src="/_resources/logo/badge_core.svg" alt="Keyp" draggable="false" class="logo-site" />
          </RouterLink>
        </div>
        <div class="w-full flex flex-col gap-1">
          <RouterLink @click.stop to="/vault" class="nav-item">
            <div class="nav-icon h-full flex items-center justify-center">
              <Vault size="20" />
            </div>
            <span v-if="store.sidebar.open" class="nav-label">Vault</span>
          </RouterLink>
          <RouterLink @click.stop to="/favorites" class="nav-item">
            <div class="nav-icon h-full flex items-center justify-center">
              <Heart size="20" />
            </div>
            <span v-if="store.sidebar.open" class="nav-label">Favorites</span>
          </RouterLink>
          <RouterLink v-if="false" @click.stop to="/settings" class="nav-item">
            <div class="nav-icon h-full flex items-center justify-center">
              <Settings size="20" />
            </div>
            <span v-if="store.sidebar.open" class="nav-label">Settings</span>
          </RouterLink>
        </div>
      </div>
      <div class="w-full">
        <kyButton
          @click.stop="store.modals.newAccount.open = !store.modals.newAccount.open"
          type="button"
          variant="primary-core"
          leftIcon="Plus"
          :label="store.sidebar.open ? 'Add new account' : ''"
          class="w-full"
        />
        <div @click.stop class="w-full mt-6 flex gap-2.5 items-center cursor-pointer overflow-hidden">
          <div class="relative w-full max-w-[53px] aspect-square rounded-full overflow-hidden flex flex-none bg-[#104737]">
            <img v-if="auth.profile?.profile_image" :src="auth.profile?.profile_image" alt="Profile image" class="w-full h-full object-cover" />
            <span v-else class="w-full h-full flex items-center justify-center text-[#C6FF72] text-lg font-semibold">{{ getInitials }}</span>
          </div>
          <div v-if="store.sidebar.open" class="flex flex-col">
            <h2 class="text-black text-base font-semibold">{{ getFullName }}</h2>
            <p class="text-[#999] text-xs font-normal">{{ auth.user?.email }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from '../../data/auth';
import { store } from '../../data/store';
import { logout } from '../../lib/authService';

import kyButton from '../../components/button/ky-button.vue';

// ICONS
import { Vault, Heart, Settings } from 'lucide-vue-next';

export default {
  name: 'sidebar',
  components: {
    kyButton,

    // ICONS
    Vault,
    Heart,
    Settings,
  },
  data() {
    return {
      auth,
      store,
    };
  },
  computed: {
    getFullName() {
      if (!auth.profile?.first_name && !auth.profile?.last_name) {
        return '';
      }

      return `${auth.profile?.first_name} ${auth.profile?.last_name}`;
    },
    getInitials() {
      if (!auth.profile?.first_name && !auth.profile?.last_name) {
        return '';
      }

      return `${auth.profile?.first_name?.slice(0, 1)}${auth.profile?.last_name?.slice(0, 1)}`;
    },
  },
  methods: {
    toggleSidebar() {
      this.store.sidebar.open = !this.store.sidebar.open;
    },

    async actionLogout() {
      if (confirm('Are you sure you want to logout?')) {
        try {
          await logout();
          this.$router.push({ name: 'signin' });
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 70px;
  max-width: 280px;
  min-width: 70px;
  padding: 44px 8px;
  background-color: white;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 2px 0 24px 0 rgba(0, 0, 0, 0.05);

  cursor: e-resize;

  transition-property: width, padding;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
}

.sidebar.sidebar-open {
  width: 280px;
  padding: 44px 1rem;
  cursor: w-resize;
}

.logo-site {
  height: 45px;
  cursor: pointer;
}

.nav-item {
  background-color: transparent;
  border: 2px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  height: 48px;
  border-radius: 8px;
  padding: 0 1rem;
  display: flex;
  gap: 8px;
  white-space: nowrap;
  align-items: center;
  justify-content: flex-start;
  transition: background-color 0.2s;
  cursor: pointer;
}

.nav-item .nav-icon,
.nav-item .nav-label {
  color: #999;
}

.nav-item.router-link-active {
  border-color: black;
  background-color: transparent;
}

.nav-item:not(.router-link-active):hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.nav-item.router-link-active .nav-icon,
.nav-item.router-link-active .nav-label {
  color: black;
}
</style>
