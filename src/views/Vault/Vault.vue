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
          <kyInput type="text" size="small" icon="SearchIcon" placeholder="Search..." forLabel="search_bar" />
        </div>
        <div class="w-full flex flex-col gap-2.5">
          <div v-for="(accounts, letter) in groupedAccounts" :key="letter" class="w-full">
            <div v-if="!store.accounts.loading" class="flex items-center mb-1 first:mt-0">
              <div class="text-[#aaa] text-base font-medium uppercase">{{ letter }}</div>
            </div>
            <div class="w-full">
              <div v-if="store.accounts.loading" class="w-full flex flex-col gap-1">
                <cardAccount v-for="index in 8" :key="index" :loading="store.accounts.loading" />
              </div>
              <div v-else-if="!store.accounts.loading" class="w-full flex flex-col gap-1">
                <cardAccount v-for="account in accounts" :key="account.id" :data="account" @load-accounts="loadAccounts" />
              </div>
            </div>
          </div>

          <!-- Messaggio quando non ci sono account -->
          <div v-if="Object.keys(groupedAccounts).length === 0 && !store.accounts.loading" class="text-center py-8 text-gray-500">
            <p class="text-lg font-semibold">Nessun account salvato</p>
            <p class="text-sm font-normal">Aggiungi il tuo primo account per iniziare</p>
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

import sidebar from '../../components/sidebar/sidebar.vue';
import mainView from '../../components/global/main-view.vue';
import cardAccount from '../../components/card/card-account.vue';
import kyInput from '../../components/input/ky-input.vue';

export default {
  name: 'Vault',
  components: {
    sidebar,
    mainView,
    cardAccount,
    kyInput,
  },
  data() {
    return {
      auth,
      store,
      sensitiveDataTimers: new Map(), // Timer per la pulizia automatica
    };
  },
  computed: {
    groupedAccounts() {
      if (!this.store.accounts.data || this.store.accounts.data.length === 0) {
        return {};
      }

      // Raggruppa gli account per lettera iniziale del nome
      const grouped = this.store.accounts.data.reduce((acc, account) => {
        const firstLetter = (account.name || '').charAt(0).toUpperCase();
        const letter = firstLetter.match(/[A-Z]/) ? firstLetter : '#'; // Usa '#' per caratteri non alfabetici

        if (!acc[letter]) {
          acc[letter] = [];
        }
        acc[letter].push(account);
        return acc;
      }, {});

      // Ordina gli account all'interno di ogni gruppo
      Object.keys(grouped).forEach((letter) => {
        grouped[letter].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'it', { sensitivity: 'base' }));
      });

      // Ordina le lettere alfabeticamente (# alla fine)
      const sortedGrouped = {};
      const sortedLetters = Object.keys(grouped).sort((a, b) => {
        if (a === '#') return 1;
        if (b === '#') return -1;
        return a.localeCompare(b, 'it');
      });

      sortedLetters.forEach((letter) => {
        sortedGrouped[letter] = grouped[letter];
      });

      return sortedGrouped;
    },
  },
  methods: {
    clearAccountSensitiveData(account, index) {
      // Pulisce i dati sensibili dall'account
      clearSensitiveData(account, ['tempDecryptedPassword']);

      // Cancella il timer se esistente
      if (this.sensitiveDataTimers.has(index)) {
        clearTimeout(this.sensitiveDataTimers.get(index));
        this.sensitiveDataTimers.delete(index);
      }
    },
    setSensitiveDataTimer(account, index, delay = 5000) {
      // Cancella il timer precedente se esiste
      if (this.sensitiveDataTimers.has(index)) {
        clearTimeout(this.sensitiveDataTimers.get(index));
      }

      // Imposta un nuovo timer
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

    async togglePasswordVisibility(account, index) {
      if (!this.store.security.isUnlocked && !this.store.security.vaultKey) {
        return;
      }

      if (account.showPassword) {
        // Nasconde la password e pulisce i dati sensibili
        this.clearAccountSensitiveData(account, index);
        account.showPassword = false;
      } else {
        // Mostra la password decrittografandola temporaneamente
        try {
          // Usa la vault key già derivata durante il login
          const vaultKey = this.ensureVaultKey();

          let decryptedPassword;

          // Prova prima con il nuovo metodo (con password_salt)
          if (account.password_salt) {
            decryptedPassword = decryptPasswordWithVaultKey(account.password, vaultKey, account.password_salt);
          } else {
            // Fallback per i dati legacy (senza password_salt)
            decryptedPassword = decryptPasswordLegacy(account.password, vaultKey);
          }

          account.tempDecryptedPassword = decryptedPassword;
          account.showPassword = true;

          const timeoutShowPassword = 15000; // 15 secondi

          // Imposta un timer per nascondere automaticamente la password dopo 30 secondi
          this.setSensitiveDataTimer(account, index, timeoutShowPassword);
        } catch (e) {
          console.error(e);
        }
      }
    },
    async copyPasswordToClipboard(account) {
      try {
        // Usa la vault key già derivata durante il login
        const vaultKey = this.ensureVaultKey();

        let passwordToCopy;

        // Decrittografa temporaneamente per la copia
        if (account.password_salt) {
          passwordToCopy = decryptPasswordWithVaultKey(account.password, vaultKey, account.password_salt);
        } else {
          passwordToCopy = decryptPasswordLegacy(account.password, vaultKey);
        }

        await navigator.clipboard.writeText(passwordToCopy);

        // Pulisce immediatamente la password dalla memoria locale
        passwordToCopy = null;

        // Mostra un feedback visivo (opzionale)
        // this.showCopyFeedback();
      } catch (err) {
        console.error('Errore nella copia:', err);
        if (err.message.includes('Vault non sbloccato')) {
          alert('Sessione scaduta. Effettua nuovamente il login.');
          this.$router.push({ name: 'signin' });
        } else {
          alert('Errore nella copia della password.');
        }
      }
    },
  },
  async mounted() {
    // Prova a ripristinare dal sessionStorage
    if (!this.store.security.isUnlocked && this.auth.isAuthenticated) {
      // console.log('🔄 Trying to restore vault from sessionStorage...');
      this.store.restoreVaultFromSession();
      // console.log('- store.security.isUnlocked after restore:', this.store.security.isUnlocked);
    }
  },
  beforeUnmount() {
    // Pulisce tutti i timer quando il componente viene distrutto
    this.sensitiveDataTimers.forEach((timer) => clearTimeout(timer));
    this.sensitiveDataTimers.clear();

    // Opzionale: pulisce la vault key se l'utente naviga via
    // sessionStorage.removeItem('vaultKey');
  },
};
</script>

<style scoped></style>
