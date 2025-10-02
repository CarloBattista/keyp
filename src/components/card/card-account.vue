<template>
  <div
    @click="handleAccount(data)"
    tabindex="0"
    class="card-account relative w-full rounded-3xl px-2.5 py-2 flex gap-3 items-center justify-between"
    :class="{ loading: loading }"
  >
    <div class="card-info w-full flex gap-3 items-center justify-start">
      <img v-if="!loading && false" :src="data?.website_logo" alt="Account image" loading="lazy" class="image-blurred" />
      <div class="account-image relative h-16 aspect-square rounded-2xl flex-none bg-[#e8e8e8]" :class="{ 'skeleton-shimmer': loading }">
        <img
          v-if="!loading && data?.website_logo"
          :src="data?.website_logo"
          alt="Account image"
          loading="lazy"
          class="nrm z-20 w-full h-full rounded-2xl object-cover"
        />
      </div>
      <!-- Normal State -->
      <div v-if="!loading" class="account-data relative w-full flex flex-col gap-[2px]">
        <h2 class="text-black text-xl font-semibold">{{ data?.name || 'Account senza nome' }}</h2>
        <p class="text-[#999] text-sm font-normal">{{ data?.email || 'example@gmail.com' }}</p>
      </div>
      <!-- Loading State -->
      <div v-else class="account-data relative w-full flex flex-col gap-[2px]">
        <div class="skeleton-shimmer w-[70%] max-w-[70%] h-7 rounded-lg"></div>
        <div class="skeleton-shimmer w-[40%] max-w-[40%] h-5 rounded-md"></div>
      </div>
    </div>
    <div class="card-actions w-fit flex gap-2 items-center justify-end">
      <dropdown @click.stop position="bottom-right" class="ml-auto">
        <template #trigger>
          <kyIconbutton type="button" variant="tertiary" size="small" icon="Ellipsis" />
        </template>
        <template #options>
          <dropdownItem @click="getAccountForEdit(data)" icon="Pencil" label="Modifica" />
          <dropdownItem @click="deleteAccount(data)" type="destructive" icon="Trash2" label="Elimina" />
        </template>
      </dropdown>
      <kyIconbutton v-if="false" @click.stop="deleteAccount(data)" type="button" variant="destructive" size="small" icon="Trash2" />
    </div>
  </div>
</template>

<script>
import { auth } from '../../data/auth';
import { store } from '../../data/store';
import { deleteAccount } from '../../lib/vaultOperations';

import kyIconbutton from '../button/ky-iconbutton.vue';
import dropdown from '../dropdown/dropdown.vue';
import dropdownItem from '../dropdown/dropdown-item.vue';

export default {
  name: 'card-account',
  components: {
    kyIconbutton,
    dropdown,
    dropdownItem,
  },
  props: {
    add: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    data: Object,
  },
  data() {
    return {
      auth,
      store,
    };
  },
  methods: {
    handleAccount(account) {
      const ACCOUNT_ID = account.id;
      const CURRENT_ROUTE = this.$route.path;

      if (!ACCOUNT_ID) {
        return;
      }

      if (CURRENT_ROUTE === '/favorites') {
        account.isFavorite = true;
      }

      this.$router.push(`${CURRENT_ROUTE}#${ACCOUNT_ID}`);
      this.store.modals.account.data = account;
      this.store.modals.account.open = true;
    },
    getAccountForEdit(account) {
      const ACCOUNT_ID = account.id;
      const CURRENT_ROUTE = this.$route.path;

      if (!ACCOUNT_ID) {
        return;
      }

      this.$router.push(`${CURRENT_ROUTE}#edit-${ACCOUNT_ID}`);
      this.store.modals.editAccount.data = account;
      this.store.modals.editAccount.open = true;
    },

    async deleteAccount(account) {
      const success = await deleteAccount(account, () => {
        this.$emit('load-accounts');
      });

      if (!success) {
        console.error('Eliminazione fallita');
      }
    },
  },
};
</script>

<style scoped>
.card-account {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.card-actions {
  opacity: 0;
}

.card-account:hover .card-actions,
.card-account:focus .card-actions {
  opacity: 1;
}

.card-account.loading {
  cursor: default;
  pointer-events: none;
}

.card-account.added {
  border: 1px dashed #e8e8e8;
}

.card-account .image-blurred {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  height: 100%;
  filter: blur(64px);
  opacity: 0.5;
}

.account-image,
.account-data {
  z-index: 20;
}

/* Skeleton Loading Animations */
.skeleton-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer-wave 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes shimmer-wave {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Pulse animation for additional loading effect */
.card-account.loading {
  animation: pulse-card 2s infinite;
}

@keyframes pulse-card {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}

/* Responsive skeleton adjustments */
@media (max-width: 640px) {
  .skeleton-shimmer {
    animation-duration: 1.2s;
  }
}

/* Dark mode support (if needed) */
@media (prefers-color-scheme: dark) {
  .skeleton-shimmer {
    background: linear-gradient(90deg, #e8e8e8 25%, #e8e8e8 50%, #e8e8e8 75%);
  }

  .skeleton-shimmer::before {
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.05), transparent);
  }
}
</style>
