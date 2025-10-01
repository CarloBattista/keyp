<template>
  <div class="flex">
    <sidebar />
    <mainView :innerContainer="640">
      <template #view>
        <div class="flex mb-2.5">
          <h1 class="text-black/50 text-3xl font-semibold">
            Welcome back, <span class="text-[#104737]">{{ auth.profile?.first_name }}</span>
          </h1>
        </div>
        <div class="relative w-full mb-6">
          <kyInput
            v-model="search.searchQuery"
            type="text"
            size="small"
            icon="SearchIcon"
            placeholder="Cerca account..."
            forLabel="search_bar"
            @input="handleSearchInput"
          />
          <div
            v-if="search.searchSuggestions.length > 0 && search.showSuggestions"
            class="absolute z-[999] top-full translate-y-[4px] w-max min-w-[180px] p-1 flex flex-col gap-1 rounded-[20px] border border-solid border-black/10 bg-white shadow-2xl shadow-black/15"
          >
            <dropdownItem
              v-for="suggestion in search.searchSuggestions"
              :key="suggestion"
              @click="selectSuggestion(suggestion)"
              :label="suggestion"
            />
          </div>
        </div>

        <!-- Indicatore di ricerca -->
        <div v-if="search.isSearching" class="mb-4 text-sm text-gray-600">Ricerca in corso...</div>
        <div
          v-else-if="!search.isTyping && !search.isSearching && !store.accounts.loading && searchQuery && search.searchResults.length > 0"
          class="mb-4 text-sm text-gray-600"
        >
          Trovati {{ search.searchResultsCount }} risultati per "{{ search.searchQuery }}"
        </div>
        <div
          v-else-if="!search.isTyping && !search.isSearching && !store.accounts.loading && search.searchQuery && search.searchResults.length === 0"
          class="mb-4 text-sm text-gray-600"
        >
          Nessun risultato per "{{ search.searchQuery }}"
        </div>

        <div class="w-full flex flex-col gap-2.5">
          <div v-for="(accounts, letter) in displayedGroupedAccounts" :key="letter" class="w-full">
            <div v-if="!store.accounts.loading && !search.isSearching" class="flex items-center mb-1 first:mt-0">
              <div class="text-[#aaa] text-base font-medium uppercase">{{ letter }}</div>
            </div>
            <div class="w-full">
              <div v-if="store.accounts.loading || search.isSearching" class="w-full flex flex-col gap-1">
                <cardAccount v-for="index in 8" :key="index" :loading="true" />
              </div>
              <div v-else class="w-full flex flex-col gap-1">
                <cardAccount v-for="account in accounts" :key="account.id" :data="account" @load-accounts="loadAccounts" @stats-updated="setStats" />
              </div>
            </div>
          </div>

          <!-- Messaggio quando non ci sono account -->
          <div
            v-if="Object.keys(displayedGroupedAccounts).length === 0 && !store.accounts.loading && !isSearching"
            class="text-center py-8 text-gray-500"
          >
            <p class="text-lg font-semibold">
              {{ search.searchQuery ? 'Nessun risultato trovato' : 'Nessun account salvato' }}
            </p>
            <p class="text-sm font-normal">
              {{ search.searchQuery ? 'Prova con termini di ricerca diversi' : 'Aggiungi il tuo primo account per iniziare' }}
            </p>
          </div>
        </div>
      </template>
    </mainView>
  </div>
</template>

<script>
import { auth } from '../../data/auth';
import { store } from '../../data/store';
import { decryptPasswordWithVaultKey, decryptPasswordLegacy, clearSensitiveData } from '../../lib/crypto';
import { SearchService, SearchUtils } from '../../lib/searchService';
import { supabase } from '../../lib/supabase';

import sidebar from '../../components/sidebar/sidebar.vue';
import mainView from '../../components/global/main-view.vue';
import cardAccount from '../../components/card/card-account.vue';
import kyInput from '../../components/input/ky-input.vue';
import dropdownItem from '../../components/dropdown/dropdown-item.vue';

export default {
  name: 'Vault',
  components: {
    sidebar,
    mainView,
    cardAccount,
    kyInput,
    dropdownItem,
  },
  data() {
    return {
      auth,
      store,
      sensitiveDataTimers: new Map(),

      search: {
        searchQuery: '',
        searchResults: [],
        searchResultsCount: 0,
        isSearching: false,
        isTyping: true,
        searchSuggestions: [],
        showSuggestions: false,
        debouncedSearch: null,
        typingTimer: null,
      },
    };
  },
  computed: {
    groupedAccounts() {
      if (!this.store.accounts.data || this.store.accounts.data.length === 0) {
        return {};
      }

      return SearchUtils.groupAccountsByLetter(this.store.accounts.data);
    },

    displayedGroupedAccounts() {
      // Se c'è una ricerca attiva, mostra i risultati della ricerca
      if (this.search.searchQuery && this.search.searchResults.length > 0) {
        return SearchUtils.groupAccountsByLetter(this.search.searchResults);
      }

      // Se c'è una ricerca ma nessun risultato, mostra oggetto vuoto
      if (this.search.searchQuery && this.search.searchResults.length === 0) {
        return {};
      }

      // Altrimenti mostra tutti gli account
      return this.groupedAccounts;
    },
  },
  methods: {
    clearAccountSensitiveData(account, index) {
      clearSensitiveData(account, ['tempDecryptedPassword']);

      if (this.sensitiveDataTimers.has(index)) {
        clearTimeout(this.sensitiveDataTimers.get(index));
        this.sensitiveDataTimers.delete(index);
      }
    },
    setSensitiveDataTimer(account, index, delay = 5000) {
      if (this.sensitiveDataTimers.has(index)) {
        clearTimeout(this.sensitiveDataTimers.get(index));
      }

      const timer = setTimeout(() => {
        this.clearAccountSensitiveData(account, index);
        account.showPassword = false;
        this.sensitiveDataTimers.delete(index);
      }, delay);

      this.sensitiveDataTimers.set(index, timer);
    },
    openNewAccountModal() {
      this.store.modals.newAccount.open = true;
    },
    loadAccounts() {
      this.$emit('load-accounts');
    },
    ensureVaultKey() {
      if (!this.store.security.vaultKey || !this.store.security.isUnlocked) {
        throw new Error('Vault non sbloccato. Effettua nuovamente il login.');
      }
      return this.store.security.vaultKey;
    },
    selectSuggestion(suggestion) {
      this.search.showSuggestions = false;
      this.search.searchSuggestions = [];

      this.search.searchQuery = suggestion;
      this.search.isTyping = false;

      if (this.search.typingTimer) {
        clearTimeout(this.search.typingTimer);
        this.search.typingTimer = null;
      }

      this.performSearch();
    },
    clearSearch() {
      this.search.searchQuery = '';
      this.search.searchResults = [];
      this.search.searchResultsCount = 0;
      this.search.isSearching = false;
      this.search.isTyping = false;
      this.search.searchSuggestions = [];
      this.search.showSuggestions = false;

      if (this.search.typingTimer) {
        clearTimeout(this.search.typingTimer);
        this.search.typingTimer = null;
      }
    },

    async handleSearchInput() {
      // Imposta che l'utente sta digitando
      this.search.isTyping = true;

      // Cancella il timer precedente
      if (this.search.typingTimer) {
        clearTimeout(this.search.typingTimer);
      }

      // Imposta un nuovo timer per determinare quando ha smesso di digitare
      this.search.typingTimer = setTimeout(() => {
        this.search.isTyping = false;
      }, 800); // 800ms dopo l'ultimo carattere digitato

      if (!this.search.searchQuery.trim()) {
        this.clearSearch();
        return;
      }

      // Usa debounce per ottimizzare le ricerche
      if (this.search.debouncedSearch) {
        this.search.debouncedSearch();
      }
    },
    async performSearch() {
      if (!this.auth.profile?.id) return;

      this.search.isSearching = true;

      try {
        const results = await SearchService.searchAccounts(this.auth.profile.id, this.search.searchQuery, {
          limit: 100,
          sortBy: 'name',
          sortOrder: 'asc',
        });

        this.search.searchResults = results;
        this.search.searchResultsCount = results.length;

        // Ottieni il conteggio totale se necessario
        if (results.length === 100) {
          this.search.searchResultsCount = await SearchService.countSearchResults(this.auth.profile.id, this.search.searchQuery);
        }
      } catch (error) {
        console.error('Errore nella ricerca:', error);
        this.search.searchResults = [];
        this.search.searchResultsCount = 0;
      } finally {
        this.search.isSearching = false;
      }
    },
    async loadSearchSuggestions() {
      if (!this.auth.profile?.id || !this.search.searchQuery.trim()) return;

      try {
        const suggestions = await SearchService.getSearchSuggestions(this.auth.profile.id, this.search.searchQuery);
        this.search.searchSuggestions = suggestions;
        this.search.showSuggestions = suggestions.length > 0;
      } catch (error) {
        console.error('Errore nel caricamento dei suggerimenti:', error);
        this.search.searchSuggestions = [];
        this.search.showSuggestions = false;
      }
    },
    async setStats(data) {
      try {
        const { error } = await supabase
          .from('vault_entries')
          .update({
            usage_count: data.usage_count,
            last_used_at: data.last_used_at,
          })
          .eq('profile_id', this.auth.profile.id)
          .eq('id', data.accountId);

        if (error) {
          console.error('Errore aggiornamento statistiche:', error);
        } else {
          // Aggiorna i dati locali
          const updateLocalData = (accounts) => {
            const account = accounts.find((acc) => acc.id === data.accountId);
            if (account) {
              account.usage_count = data.usage_count;
              account.last_used_at = data.last_used_at;
            }
          };

          // Aggiorna sia gli account principali che i risultati di ricerca
          updateLocalData(this.store.accounts.data);
          updateLocalData(this.search.searchResults);
        }
      } catch (error) {
        console.error('Errore nella funzione setStats:', error);
      }
    },
    async togglePasswordVisibility(account, index) {
      if (!this.store.security.isUnlocked && !this.store.security.vaultKey) {
        return;
      }

      if (account.showPassword) {
        this.clearAccountSensitiveData(account, index);
        account.showPassword = false;
      } else {
        try {
          const vaultKey = this.ensureVaultKey();

          let decryptedPassword;

          if (account.password_salt) {
            decryptedPassword = decryptPasswordWithVaultKey(account.password, vaultKey, account.password_salt);
          } else {
            decryptedPassword = decryptPasswordLegacy(account.password, vaultKey);
          }

          account.tempDecryptedPassword = decryptedPassword;
          account.showPassword = true;

          const timeoutShowPassword = 15000;
          this.setSensitiveDataTimer(account, index, timeoutShowPassword);
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
  watch: {
    'search.searchQuery': {
      handler(newValue) {
        if (this.search.isSelectingSuggestion) {
          return;
        }

        if (newValue && newValue.length > 1) {
          this.loadSearchSuggestions();
        } else {
          this.search.showSuggestions = false;
          this.search.searchSuggestions = [];
        }
      },
      immediate: false,
    },
  },
  async mounted() {
    // Inizializza il debounce per la ricerca
    this.search.debouncedSearch = SearchUtils.debounce(this.performSearch.bind(this), 300);

    if (!this.store.security.isUnlocked && this.auth.isAuthenticated) {
      this.store.restoreVaultFromSession();
    }

    // Nascondi suggerimenti quando si clicca fuori
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.relative')) {
        this.search.showSuggestions = false;
      }
    });
  },
  beforeUnmount() {
    this.search.sensitiveDataTimers.forEach((timer) => clearTimeout(timer));
    this.search.sensitiveDataTimers.clear();

    if (this.search.typingTimer) {
      clearTimeout(this.search.typingTimer);
    }

    document.removeEventListener('click', () => {});
  },
};
</script>

<style scoped></style>
