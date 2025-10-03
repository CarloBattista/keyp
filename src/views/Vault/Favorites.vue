<template>
  <div class="flex">
    <sidebar />
    <mainView :innerContainer="640">
      <template #view>
        <div class="w-full flex flex-col gap-2.5">
          <cardAccount v-for="account in accounts.data" :key="account.id" :data="account.vault_entries" :favorites="true" />

          <!-- Messaggio quando non ci sono account -->
          <div v-if="accounts.data?.length === 0 && !accounts.loading" class="text-center py-8 text-gray-500">
            <p class="text-lg font-semibold">Non hai ancora nessun account fra i preferiti</p>
            <p class="text-sm font-normal">
              Aggiungi ai preferiti gli elementi che usi di più per renderli più facili da trovare in Keyp in un secondo momento.
            </p>
          </div>
        </div>
      </template>
    </mainView>
  </div>
</template>

<script>
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { store } from '../../data/store';

import sidebar from '../../components/sidebar/sidebar.vue';
import mainView from '../../components/global/main-view.vue';
import cardAccount from '../../components/card/card-account.vue';

export default {
  name: 'Favorites',
  components: {
    sidebar,
    mainView,
    cardAccount,
  },
  data() {
    return {
      auth,
      store,

      accounts: {
        data: null,
        error: null,
        loading: false,
      },
    };
  },
  methods: {
    async getFavoritesAccounts() {
      if (!this.auth.profile || !this.auth.profile.id) {
        this.accounts.loading = false;
        return;
      }

      this.accounts.loading = true;

      try {
        const { data, error } = await supabase.from('favorites').select('*, vault_entries(*)').eq('profile_id', this.auth.profile.id);

        if (!error) {
          this.accounts.data = data;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.accounts.loading = false;
      }
    },
  },
  watch: {
    // Ascolta i cambiamenti nell'evento favoritesUpdated
    'store.events.favoritesUpdated': {
      handler() {
        // Ricarica i preferiti quando viene emesso l'evento
        this.getFavoritesAccounts();
      },
      immediate: false,
    },
    // Ascolta quando il profilo diventa disponibile
    'auth.profile': {
      handler(newProfile) {
        if (newProfile && newProfile.id) {
          this.getFavoritesAccounts();
        }
      },
      immediate: true,
    },
  },
  async mounted() {
    if (this.auth.profile && this.auth.profile.id) {
      await this.getFavoritesAccounts();
    }
  },
};
</script>

<style scoped></style>
