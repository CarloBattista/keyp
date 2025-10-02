<template>
  <div class="flex">
    <sidebar />
    <mainView :innerContainer="640">
      <template #view>
        <div class="flex mb-6">
          <h1 class="text-black/50 text-3xl font-semibold">Settings</h1>
        </div>

        <!-- Profile Section -->
        <div class="mb-8 bg-white rounded-2xl border border-black/10 overflow-hidden">
          <div class="p-6 border-b border-black/10">
            <h2 class="text-xl font-semibold text-black mb-1">Profile</h2>
            <p class="text-sm text-gray-600">Gestisci le informazioni del tuo profilo</p>
          </div>
          <div class="p-6">
            <div class="flex gap-6 items-start md:flex-col md:items-center md:text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="relative w-16 h-16 rounded-full overflow-hidden flex bg-[#104737]">
                  <img v-if="auth.profile?.profile_image" :src="auth.profile?.profile_image" alt="Profile image" class="w-full h-full object-cover" />
                  <span v-else class="w-full h-full flex items-center justify-center text-[#C6FF72] text-xl font-semibold">
                    {{ getInitials }}
                  </span>
                </div>
                <kyButton type="button" variant="tertiary" label="Cambia foto" size="small" @click="changeProfileImage" />
              </div>
              <div class="flex-1 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <kyInput v-model="profileData.first_name" type="text" label="Nome" forLabel="first_name" />
                  <kyInput v-model="profileData.last_name" type="text" label="Cognome" forLabel="last_name" />
                </div>
                <kyInput v-model="profileData.email" type="email" label="Email" forLabel="email" :readOnly="true" />
                <div class="flex gap-2 mt-4">
                  <kyButton @click="updateProfile" type="button" variant="primary-core" label="Salva modifiche" :loading="profileLoading" />
                  <kyButton @click="resetProfileData" type="button" variant="tertiary" label="Annulla" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Section -->
        <div class="mb-8 bg-white rounded-2xl border border-black/10 overflow-hidden">
          <div class="p-6 border-b border-black/10">
            <h2 class="text-xl font-semibold text-black mb-1">Security</h2>
            <p class="text-sm text-gray-600">Gestisci la sicurezza del tuo account</p>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg md:flex-col md:items-start md:gap-3">
                <div class="flex-1 md:w-full">
                  <h3 class="font-semibold text-black mb-1">Master Password</h3>
                  <p class="text-sm text-gray-600">Cambia la tua master password</p>
                </div>
                <kyButton @click="openChangePasswordModal" type="button" variant="secondary" label="Cambia password" />
              </div>

              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg md:flex-col md:items-start md:gap-3">
                <div class="flex-1 md:w-full">
                  <h3 class="font-semibold text-black mb-1">Secret Key</h3>
                  <p class="text-sm text-gray-600">Visualizza o rigenera la tua secret key</p>
                </div>
                <div class="flex gap-2">
                  <kyButton @click="showSecretKey" type="button" variant="tertiary" label="Mostra" />
                  <kyButton @click="regenerateSecretKey" type="button" variant="secondary" label="Rigenera" />
                </div>
              </div>

              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg md:flex-col md:items-start md:gap-3">
                <div class="flex-1 md:w-full">
                  <h3 class="font-semibold text-black mb-1">Auto-lock</h3>
                  <p class="text-sm text-gray-600">Blocca automaticamente il vault dopo un periodo di inattività</p>
                </div>
                <div class="flex items-center gap-4">
                  <select
                    v-model="autoLockTime"
                    @change="updateAutoLockTime"
                    class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    <option value="300000">5 minuti</option>
                    <option value="900000">15 minuti</option>
                    <option value="1800000">30 minuti</option>
                    <option value="3600000">1 ora</option>
                    <option value="0">Mai</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Section -->
        <div class="mb-8 bg-white rounded-2xl border border-black/10 overflow-hidden">
          <div class="p-6 border-b border-black/10">
            <h2 class="text-xl font-semibold text-black mb-1">Data Management</h2>
            <p class="text-sm text-gray-600">Gestisci i tuoi dati e backup</p>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg md:flex-col md:items-start md:gap-3">
                <div class="flex-1 md:w-full">
                  <h3 class="font-semibold text-black mb-1">Export Data</h3>
                  <p class="text-sm text-gray-600">Esporta tutti i tuoi account in formato JSON</p>
                </div>
                <kyButton @click="exportData" type="button" variant="secondary" label="Esporta" leftIcon="Download" :loading="exportLoading" />
              </div>

              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg md:flex-col md:items-start md:gap-3">
                <div class="flex-1 md:w-full">
                  <h3 class="font-semibold text-black mb-1">Import Data</h3>
                  <p class="text-sm text-gray-600">Importa account da un file JSON</p>
                </div>
                <kyButton @click="importData" type="button" variant="secondary" label="Importa" />
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="mb-8 bg-red-50 rounded-2xl border border-red-200 overflow-hidden">
          <div class="p-6 border-b border-red-200">
            <h2 class="text-xl font-semibold text-red-600 mb-1">Danger Zone</h2>
            <p class="text-sm text-gray-600">Azioni irreversibili</p>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-white md:flex-col md:items-start md:gap-3">
                <div class="flex-1 md:w-full">
                  <h3 class="font-semibold text-red-600 mb-1">Delete All Data</h3>
                  <p class="text-sm text-red-500">Elimina permanentemente tutti i tuoi account e dati</p>
                </div>
                <kyButton @click="deleteAllData" type="button" variant="destructive" label="Elimina tutto" />
              </div>

              <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-white md:flex-col md:items-start md:gap-3">
                <div class="flex-1 md:w-full">
                  <h3 class="font-semibold text-red-600 mb-1">Delete Account</h3>
                  <p class="text-sm text-red-500">Elimina permanentemente il tuo account Keyp</p>
                </div>
                <kyButton @click="deleteAccount" type="button" variant="destructive" label="Elimina account" />
              </div>
            </div>
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
import kyInput from '../../components/input/ky-input.vue';
import kyButton from '../../components/button/ky-button.vue';

export default {
  name: 'Settings',
  components: {
    sidebar,
    mainView,
    kyInput,
    kyButton,
  },
  data() {
    return {
      auth,
      store,
      profileLoading: false,
      exportLoading: false,
      autoLockTime: 900000, // 15 minuti default
      profileData: {
        first_name: '',
        last_name: '',
        email: '',
      },
    };
  },
  computed: {
    getInitials() {
      if (!this.auth.profile?.first_name && !this.auth.profile?.last_name) {
        return '';
      }
      return `${this.auth.profile?.first_name?.slice(0, 1)}${this.auth.profile?.last_name?.slice(0, 1)}`;
    },
  },
  methods: {
    initializeProfileData() {
      if (this.auth.profile) {
        this.profileData = {
          first_name: this.auth.profile.first_name || '',
          last_name: this.auth.profile.last_name || '',
          email: this.auth.user?.email || '',
        };
      }
    },
    resetProfileData() {
      this.initializeProfileData();
    },
    changeProfileImage() {
      // TODO: Implementare upload immagine profilo
      alert('Funzionalità in sviluppo');
    },
    openChangePasswordModal() {
      // TODO: Implementare modal cambio password
      alert('Funzionalità in sviluppo');
    },
    showSecretKey() {
      // TODO: Implementare visualizzazione secret key
      alert('Funzionalità in sviluppo');
    },
    regenerateSecretKey() {
      if (confirm('Sei sicuro di voler rigenerare la secret key? Dovrai aggiornare tutti i tuoi dispositivi.')) {
        // TODO: Implementare rigenerazione secret key
        alert('Funzionalità in sviluppo');
      }
    },
    updateAutoLockTime() {
      // TODO: Implementare aggiornamento auto-lock
      this.store.security.autoLockTime = parseInt(this.autoLockTime);
      alert('Tempo di auto-lock aggiornato');
    },
    importData() {
      // TODO: Implementare import dati
      alert('Funzionalità in sviluppo');
    },
    deleteAllData() {
      if (confirm('Sei sicuro di voler eliminare tutti i tuoi dati? Questa azione è irreversibile.')) {
        if (confirm('Conferma eliminazione di tutti i dati. Questa azione NON può essere annullata.')) {
          // TODO: Implementare eliminazione dati
          alert('Funzionalità in sviluppo');
        }
      }
    },
    deleteAccount() {
      if (confirm('Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.')) {
        if (confirm('Conferma eliminazione account. Tutti i tuoi dati verranno persi per sempre.')) {
          // TODO: Implementare eliminazione account
          alert('Funzionalità in sviluppo');
        }
      }
    },

    async updateProfile() {
      this.profileLoading = true;
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: this.profileData.first_name,
            last_name: this.profileData.last_name,
          })
          .eq('user_id', this.auth.user.id);

        if (!error) {
          // Aggiorna i dati locali
          this.auth.profile.first_name = this.profileData.first_name;
          this.auth.profile.last_name = this.profileData.last_name;
        } else {
          throw error;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.profileLoading = false;
      }
    },
    async exportData() {
      this.exportLoading = true;
      try {
        // TODO: Implementare export dati
        alert('Funzionalità in sviluppo');
      } catch (e) {
        console.error(e);
      } finally {
        this.exportLoading = false;
      }
    },
  },
  mounted() {
    this.initializeProfileData();
    // Inizializza auto-lock time dal store se disponibile
    if (this.store.security.autoLockTime) {
      this.autoLockTime = this.store.security.autoLockTime;
    }
  },
};
</script>
