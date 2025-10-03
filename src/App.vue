<template>
  <div>
    <RouterView @load-accounts="loadAccounts" />
    <div
      v-if="ENV === 'debug' && false"
      class="fixed z-[99999] top-3 right-3 p-2 px-4 font-semibold uppercase border border-dashed border-red-500 bg-red-500/30"
    >
      {{ ENV === 'debug' ? 'In testing environment' : 'in production environment' }}
    </div>

    <modal
      v-if="store.modals.newAccount.open && !store.modals.passwordExpiration.open"
      :header="true"
      :footer="true"
      modalKey="newAccount"
      head="Aggiungi un nuovo account"
    >
      <template #body>
        <notification
          v-if="store.modals.passwordExpiration.data.password_expiration_date !== '.'"
          type="warning"
          :message="'La password scadrà il ' + formatCreatedDate(store.modals.account.data.password_expiration_date, { showTime: true })"
          class="mb-2"
        />
        <form @submit.prevent>
          <div class="w-full flex flex-col gap-4 mb-4">
            <div class="w-full grid grid-cols-2 gap-4">
              <kyInput v-model="store.modals.newAccount.data.name" type="text" label="Name" forLabel="name" />
              <kyInput v-model="store.modals.newAccount.data.username" type="text" label="Username" forLabel="username" />
            </div>
            <kyInput v-model="store.modals.newAccount.data.email" type="email" label="Email" forLabel="email" />
            <dropdown position="bottom-left">
              <template #trigger>
                <kyInput v-model="store.modals.newAccount.data.password" type="password" label="Password" forLabel="password" />
                <strengthBar
                  v-if="store.modals.newAccount.data.password.length >= 1"
                  :password="store.modals.newAccount.data.password"
                  class="mt-2"
                />
                <floatMenu v-if="passwordGenOptions.menuOpen">
                  <template #body>
                    <div class="w-full flex flex-col gap-2">
                      <div class="w-full h-12 border-b border-solid border-black/10 flex gap-4 items-center">
                        <span class="text-[#999] text-base font-normal">Caratteri</span>
                        <SliderBar
                          v-model="passwordGenOptions.length.value"
                          :min="passwordGenOptions.length.min"
                          :max="passwordGenOptions.length.max"
                          :disabled="false"
                        />
                        <kyInput
                          v-model="passwordGenOptions.length.value"
                          type="number"
                          size="small"
                          forLabel="password_length"
                          :min="passwordGenOptions.length.min"
                          :max="passwordGenOptions.length.max"
                          @update:modelValue="clampPasswordLength"
                        />
                      </div>
                      <div class="w-full h-12 border-b border-solid border-black/10 flex items-center justify-between">
                        <span class="text-[#999] text-base font-normal">Numeri</span>
                        <checkbox v-model="passwordGenOptions.includeNumbers" :checked="passwordGenOptions.includeNumbers" />
                      </div>
                      <div class="w-full h-12 flex items-center justify-between">
                        <span class="text-[#999] text-base font-normal">Simboli</span>
                        <checkbox v-model="passwordGenOptions.includeSymbols" :checked="passwordGenOptions.includeSymbols" />
                      </div>
                    </div>
                  </template>
                  <template #footer>
                    <kyButton @click="passwordGenOptions.menuOpen = false" type="button" size="small" variant="tertiary" label="Cancel" />
                    <kyButton @click="generateNewAccountPassword" type="button" size="small" variant="primary-core" label="Generate" />
                  </template>
                </floatMenu>
              </template>
              <template #options>
                <dropdownItem @click="passwordGenOptions.menuOpen = !passwordGenOptions.menuOpen" label="Genera una password sicura" />
                <dropdownItem
                  @click="handleModalExpirationPassword('newAccount', store.modals.newAccount.data)"
                  :label="
                    store.modals.passwordExpiration.data.password_expiration_date !== '.'
                      ? 'Modifica scadenza password'
                      : 'Aggiungi scadenza password'
                  "
                />
              </template>
            </dropdown>
            <p v-if="store.modals.passwordExpiration.data.password_expiration_date !== '.'">
              La password scadrà il {{ formatCreatedDate(store.modals.passwordExpiration.data.password_expiration_date, { showTime: true }) }}
            </p>
            <kyTextarea
              v-model="store.modals.newAccount.data.notes"
              label="Account notes"
              placeholder="Write account notes here"
              forLabel="account_notes"
            />
          </div>
        </form>
      </template>
      <template #footer>
        <kyButton @click="store.modals.newAccount.open = false" type="button" variant="tertiary" label="Cancel" />
        <kyButton @click="actionAddAccount" type="submit" variant="primary-core" label="Save" :loading="store.modals.newAccount.loading" />
      </template>
    </modal>
    <modal
      v-if="store.modals.editAccount.open && !store.modals.passwordExpiration.open"
      :header="true"
      :footer="true"
      modalKey="editAccount"
      head="Modifica account"
    >
      <template #body>
        <notification
          v-if="store.modals.passwordExpiration.data.password_expiration_date !== '.'"
          type="warning"
          :message="'La password scadrà il ' + formatCreatedDate(store.modals.account.data.password_expiration_date, { showTime: true })"
          class="mb-2"
        />
        <form @submit.prevent>
          <div class="w-full flex flex-col gap-4 mb-4">
            <div class="w-full grid grid-cols-2 gap-4">
              <kyInput v-model="store.modals.editAccount.data.name" type="text" label="Name" forLabel="name" />
              <kyInput v-model="store.modals.editAccount.data.username" type="text" label="Username" forLabel="username" />
            </div>
            <kyInput v-model="store.modals.editAccount.data.email" type="email" label="Email" forLabel="email" />
            <!-- <kyInput v-model="store.modals.editAccount.data.password" type="password" label="Password" forLabel="password" /> -->
            <dropdown position="bottom-left">
              <template #trigger>
                <kyInput v-model="store.modals.editAccount.data.password" type="password" label="Password" forLabel="password" />
                <strengthBar
                  v-if="store.modals.editAccount.data.password.length >= 1"
                  :password="store.modals.editAccount.data.password"
                  class="mt-2"
                />
                <floatMenu v-if="passwordGenOptions.menuOpen">
                  <template #body>
                    <div class="w-full flex flex-col gap-2">
                      <div class="w-full h-12 border-b border-solid border-black/10 flex gap-4 items-center">
                        <span class="text-[#999] text-base font-normal">Caratteri</span>
                        <SliderBar
                          v-model="passwordGenOptions.length.value"
                          :min="passwordGenOptions.length.min"
                          :max="passwordGenOptions.length.max"
                          :disabled="false"
                        />
                        <kyInput
                          v-model="passwordGenOptions.length.value"
                          type="number"
                          size="small"
                          forLabel="password_length"
                          :min="passwordGenOptions.length.min"
                          :max="passwordGenOptions.length.max"
                          @update:modelValue="clampPasswordLength"
                        />
                      </div>
                      <div class="w-full h-12 border-b border-solid border-black/10 flex items-center justify-between">
                        <span class="text-[#999] text-base font-normal">Numeri</span>
                        <checkbox v-model="passwordGenOptions.includeNumbers" :checked="passwordGenOptions.includeNumbers" />
                      </div>
                      <div class="w-full h-12 flex items-center justify-between">
                        <span class="text-[#999] text-base font-normal">Simboli</span>
                        <checkbox v-model="passwordGenOptions.includeSymbols" :checked="passwordGenOptions.includeSymbols" />
                      </div>
                    </div>
                  </template>
                  <template #footer>
                    <kyButton @click="passwordGenOptions.menuOpen = false" type="button" size="small" variant="tertiary" label="Cancel" />
                    <kyButton @click="generateNewAccountPassword" type="button" size="small" variant="primary-core" label="Generate" />
                  </template>
                </floatMenu>
              </template>
              <template #options>
                <dropdownItem @click="passwordGenOptions.menuOpen = !passwordGenOptions.menuOpen" label="Genera una password sicura" />
                <dropdownItem
                  @click="handleModalExpirationPassword('editAccount', store.modals.editAccount.data)"
                  :label="
                    store.modals.passwordExpiration.data.password_expiration_date !== '.'
                      ? 'Modifica scadenza password'
                      : 'Aggiungi scadenza password'
                  "
                />
              </template>
            </dropdown>
            <kyTextarea
              v-model="store.modals.editAccount.data.notes"
              label="Account notes"
              placeholder="Write account notes here"
              forLabel="account_notes"
            />
          </div>
        </form>
      </template>
      <template #footer>
        <kyButton @click="store.modals.editAccount.open = false" type="button" variant="tertiary" label="Cancel" />
        <kyButton @click="actionUpdateAccount" type="submit" variant="primary-core" label="Save" :loading="store.modals.editAccount.loading" />
      </template>
    </modal>
    <modal
      v-if="store.modals.account.open && !store.modals.passwordExpiration.open"
      :header="true"
      :footer="false"
      modalKey="account"
      head="Dettagli account"
    >
      <template #body>
        <div class="card-info w-full flex gap-3 items-center justify-start">
          <div class="account-image relative h-19 aspect-square rounded-[20px] flex-none bg-[#e8e8e8]">
            <img
              v-if="store.modals.account.data?.website_logo"
              :src="store.modals.account.data?.website_logo"
              alt="Account image"
              loading="lazy"
              class="nrm z-20 w-full h-full rounded-2xl object-cover"
            />
          </div>
          <div class="account-data relative w-full flex flex-col gap-[2px]">
            <h2 class="text-black text-xl font-semibold">{{ store.modals.account.data?.name || 'Account senza nome' }}</h2>
            <div class="flex gap-1 items-center">
              <kyIconButton
                @click="actionFavorites(store.modals.account.data)"
                type="button"
                :variant="store.modals.account.data?.isFavorite ? 'primary-core' : 'tertiary'"
                size="small"
                icon="Star"
                class="favorites-button"
                :class="{ favorites: store.modals.account.data?.isFavorite }"
              />
              <kyIconButton v-if="false" type="button" variant="tertiary" size="small" icon="SquareArrowOutUpRight" />
              <dropdown position="bottom-right" class="ml-auto">
                <template #trigger>
                  <kyIconButton type="button" variant="secondary" size="small" icon="Ellipsis" class="ml-auto" />
                </template>
                <template #options>
                  <dropdownItem @click="getAccountForEdit(store.modals.account.data)" icon="Pencil" label="Modifica" />
                  <dropdownItem @click="deleteAccount(store.modals.account.data)" type="destructive" icon="Trash2" label="Elimina" />
                </template>
              </dropdown>
            </div>
          </div>
        </div>
        <div class="w-full mt-6 flex flex-col gap-4">
          <notification
            v-if="store.modals.account.data.password_expiration_date"
            type="warning"
            :message="'La password scadrà il ' + formatCreatedDate(store.modals.account.data.password_expiration_date, { showTime: true })"
            class="mb-2"
          />
          <kyGrouped>
            <kyInputCopy
              v-if="store.modals.account.data?.email"
              type="email"
              label="Email address"
              :value="store.modals.account.data?.email"
              :grouped="true"
            />
            <kyInputCopy
              v-if="store.modals.account.data?.password"
              :type="store.modals.account.data?.showPassword ? 'text' : 'password'"
              forType="password"
              label="Password"
              :value="store.modals.account.data?.showPassword ? store.modals.account.data?.tempDecryptedPassword : '••••••••••'"
              :grouped="true"
              @copy-password-to-clipboard="copyPasswordToClipboard"
              @show-password="togglePasswordVisibility"
            />
          </kyGrouped>
          <strengthBar
            v-if="store.modals.account.data?.showPassword && store.modals.account.data?.tempDecryptedPassword.length >= 1"
            :password="store.modals.account.data?.tempDecryptedPassword"
          />
          <kyInputCopy v-if="store.modals.account.data?.username" type="text" label="Username" :value="store.modals.account.data?.username" />
          <kyInputCopy
            v-if="store.modals.account.data?.notes"
            type="notes"
            label="Notes"
            :value="store.modals.account.data?.notes"
            :copiable="false"
          />
          <p v-if="store.modals.account.data?.updated_at" class="text-[#aaa]">
            Ultima modifica {{ formatUpdatedDate(store.modals.account.data?.updated_at, { showTime: true }) }}
          </p>
          <p v-else-if="!store.modals.account.data?.updated_at" class="text-[#aaa]">
            Creato il {{ formatCreatedDate(store.modals.account.data?.created_at, { showTime: true }) }}
          </p>
        </div>
      </template>
      <template #footer></template>
    </modal>

    <modalAction v-if="store.modals.passwordExpiration.open" modalKey="passwordExpiration" head="Scadenza password">
      <template #body>
        <form @submit.prevent>
          <kyInput
            v-model="store.modals.passwordExpiration.data.password_expiration_date"
            type="datetime-local"
            label="Scadenza password"
            forLabel="password_expiration_date"
            :error="store.modals.passwordExpiration.error.password_expiration_date"
          />
        </form>
      </template>
      <template #footer>
        <kyButton @click="store.modals.passwordExpiration.open = false" type="button" variant="tertiary" label="Cancel" />
        <kyButton @click="store.modals.passwordExpiration.open = false" type="submit" variant="primary-core" label="Save" />
      </template>
    </modalAction>
  </div>
  <toast />
</template>

<script>
import { supabase } from './lib/supabase';
import { auth } from './data/auth';
import { store } from './data/store';
import { decryptAES } from './lib/crypto';
import { SessionManager } from './lib/sessionManager';
import { encryptPasswordWithVaultKey, decryptPasswordWithVaultKey, decryptPasswordLegacy } from './lib/crypto';
import { generateAvatarFallback, AvatarSizes } from './lib/avatar';
import { deleteAccount, toggleFavorite } from './lib/vaultOperations';
import { formatCreatedDate, formatUpdatedDate } from './lib/dateUtils';
import { generatePassword } from './lib/passwordGenerator';

import modal from './components/modal/modal.vue';
import modalAction from './components/modal/modal-action.vue';
import kyInput from './components/input/ky-input.vue';
import kyTextarea from './components/input/ky-textarea.vue';
import kyButton from './components/button/ky-button.vue';
import kyIconButton from './components/button/ky-iconbutton.vue';
import dropdown from './components/dropdown/dropdown.vue';
import dropdownItem from './components/dropdown/dropdown-item.vue';
import kyGrouped from './components/button/ky-grouped.vue';
import kyInputCopy from './components/button/ky-input-copy.vue';
import toast from './components/toast/toast.vue';
import floatMenu from './components/float/float-menu.vue';
import SliderBar from './components/slider/slider-bar.vue';
import checkbox from './components/toggle/checkbox.vue';
import strengthBar from './components/strength/strength-bar.vue';
import notification from './components/notification/notification.vue';

export default {
  name: 'App',
  components: {
    modal,
    modalAction,
    kyInput,
    kyTextarea,
    kyButton,
    kyIconButton,
    dropdown,
    dropdownItem,
    kyGrouped,
    kyInputCopy,
    toast,
    floatMenu,
    SliderBar,
    checkbox,
    strengthBar,
    notification,
  },
  data() {
    return {
      auth,
      store,
      ENV: import.meta.env.VITE_ENV,

      sensitiveDataTimers: new Map(),
      passwordGenOptions: {
        menuOpen: false,
        length: {
          value: 16,
          min: 8,
          max: 100,
        },
        includeNumbers: true,
        includeSymbols: true,
      },
    };
  },
  methods: {
    formatCreatedDate,
    formatUpdatedDate,

    // Verifica che la vault key sia disponibile nello store
    ensureVaultKey() {
      if (!this.store.security.vaultKey || !this.store.security.isUnlocked) {
        throw new Error('Vault non sbloccato. Effettua nuovamente il login.');
      }

      return this.store.security.vaultKey;
    },
    handleResize() {
      if (window.innerWidth < 768) {
        this.store.sidebar.open = false;
      }
    },
    clearVaultData() {
      sessionStorage.removeItem('encryptedVaultKey');
      this.store.security.vaultKey = null;
      this.store.security.isVaultUnlocked = false;
      if (this.store.security.autoLockTimer) {
        clearTimeout(this.store.security.autoLockTimer);
        this.store.security.autoLockTimer = null;
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
    clearAccountSensitiveData(account) {
      if (account.tempDecryptedPassword) {
        // Sovrascrivi la password temporanea con caratteri casuali prima di eliminarla
        account.tempDecryptedPassword = Array(account.tempDecryptedPassword.length)
          .fill(0)
          .map(() => Math.random().toString(36))
          .join('');
        account.tempDecryptedPassword = null;
      }
    },
    generateNewAccountPassword() {
      const pwd = generatePassword({
        length: this.passwordGenOptions.length.value,
        includeNumbers: this.passwordGenOptions.includeNumbers,
        includeSymbols: this.passwordGenOptions.includeSymbols,
        excludeAmbiguous: true,
        requireEach: true,
      });

      if (this.store.modals.newAccount.open) {
        this.store.modals.newAccount.data.password = pwd;
      } else if (this.store.modals.editAccount.open) {
        this.store.modals.editAccount.data.password = pwd;
      }

      // this.passwordGenOptions.menuOpen = false;
    },
    clampPasswordLength(val) {
      const min = this.passwordGenOptions.length.min;
      const max = this.passwordGenOptions.length.max;
      let n = Number(val);
      if (!Number.isFinite(n)) n = min;
      if (n < min) n = min;
      if (n > max) n = max;
      this.passwordGenOptions.length.value = n;
    },
    handleModalExpirationPassword(modalKey) {
      this.store.modals.passwordExpiration.open = true;

      if (this.store.modals[modalKey].open) {
        this.store.modals.passwordExpiration.data.password_expiration_date;
      }
    },

    async getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error) {
          // console.log(data);

          this.auth.user = data.user;
          this.auth.isAuthenticated = true;

          localStorage.setItem('isAuthenticated', true);

          await this.getSession();
          await this.getProfile();
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!error) {
          // console.log(data);
          this.auth.session = data.session;
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getProfile() {
      if (!this.auth.user?.id) return;

      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('user_id', this.auth.user.id).maybeSingle();

        if (!error) {
          this.auth.profile = data;
        }
      } catch (e) {
        console.error(e);
      }
    },

    async restoreVaultKey() {
      // Non fare controlli di autenticazione per le rotte di onboarding
      const onboardingRoutes = ['/identity/signin', '/identity/signup', '/identity/verify', '/identity/forgot-password', '/identity/reset-password'];

      if (onboardingRoutes.includes(this.$route.path)) {
        return;
      }

      if (!this.auth.session?.access_token) {
        this.$router.push({ name: 'signin' });
        return;
      }

      try {
        const encryptedVaultKey = sessionStorage.getItem('encryptedVaultKey');
        if (!encryptedVaultKey) {
          this.$router.push({ name: 'signin' });
          return;
        }

        const vaultKey = await decryptAES(encryptedVaultKey, this.auth.session.access_token);
        this.store.unlockVault(vaultKey);
      } catch (e) {
        console.error(e);
        SessionManager.clearAllData();
        this.$router.push({ name: 'signin' });
      }
    },
    async actionAddAccount() {
      this.store.modals.newAccount.loading = true;

      if (!this.auth.profile.id) {
        this.store.modals.newAccount.loading = false;
        return;
      }

      const CURRENT_ROUTE = this.$route.path;

      try {
        // Usa la vault key già derivata durante il login
        const vaultKey = this.ensureVaultKey();

        // Usa la nuova funzione con vault key derivata
        const encryptionResult = encryptPasswordWithVaultKey(this.store.modals.newAccount.data.password, vaultKey);

        const websiteLogo = generateAvatarFallback(this.store.modals.newAccount.data.name, AvatarSizes.LARGE);

        const { error } = await supabase.from('vault_entries').insert({
          profile_id: this.auth.profile.id,
          name: this.store.modals.newAccount.data.name,
          email: this.store.modals.newAccount.data.email,
          password: encryptionResult.encryptedPassword,
          password_salt: encryptionResult.passwordSalt,
          notes: this.store.modals.newAccount.data.notes,
          password_expiration_date: this.store.modals.passwordExpiration.data.password_expiration_date,
          password_last_changed: new Date().toISOString(),
          website_logo: websiteLogo,
        });

        if (!error) {
          this.store.modals.newAccount.open = false;
          await this.loadAccounts();

          if (CURRENT_ROUTE !== '/vault') {
            this.$router.push({ name: 'vault' });
          }

          this.store.modals.newAccount.data.name = '';
          this.store.modals.newAccount.data.username = '';
          this.store.modals.newAccount.data.email = '';
          this.store.modals.newAccount.data.password = '';
          this.store.modals.newAccount.data.notes = '';
          this.store.modals.newAccount.data.password_expiration_date = '';
          this.store.modals.passwordExpiration.data.password_expiration_date = '';
        }
      } catch (e) {
        console.error(e);
        if (e.message.includes('Vault non sbloccato')) {
          alert('Sessione scaduta. Effettua nuovamente il login.');
          this.$router.push({ name: 'signin' });
        } else {
          // eslint-disable-next-line quotes
          alert("Errore nell'aggiunta dell'account.");
        }
      } finally {
        this.store.modals.newAccount.loading = false;
      }
    },
    async loadAccounts() {
      this.store.accounts.loading = true;

      if (!this.auth.profile || !this.auth.profile.id) {
        this.store.accounts.loading = false;
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vault_entries')
          .select('id, name, email, password, password_salt, notes, website_logo, created_at, updated_at')
          .eq('profile_id', this.auth.profile.id);

        if (!error) {
          // console.log(data);
          this.store.accounts.data = data;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.store.accounts.loading = false;
      }
    },
    async getAccount(accountId) {
      this.store.modals.account.loading = true;

      try {
        // Carica i dati dell'account
        const { data: accountData, error: accountError } = await supabase.from('vault_entries').select('*').eq('id', accountId).single();

        if (!accountError && accountData) {
          this.store.modals.account.data = accountData;

          // Controlla se l'account è tra i preferiti
          const { data: favoriteData, error: favoriteError } = await supabase
            .from('favorites')
            .select('id')
            .eq('profile_id', this.auth.profile.id)
            .eq('account_id', accountId)
            .maybeSingle();

          // Imposta lo stato dei preferiti
          this.store.modals.account.data.isFavorite = !favoriteError && favoriteData;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.store.modals.account.loading = false;
      }
    },
    async getAccountForEdit(account) {
      this.store.modals.editAccount.loading = true;

      const ACCOUNT_ID = account.id;
      const CURRENT_ROUTE = this.$route.path;

      try {
        const { data, error } = await supabase.from('vault_entries').select('*').eq('id', ACCOUNT_ID).single();

        if (!error && data) {
          // console.log(data);
          this.store.modals.editAccount.data = data;
          this.store.modals.editAccount.open = true;

          this.$router.push(`${CURRENT_ROUTE}#edit-${ACCOUNT_ID}`);

          this.store.modals.account.open = false;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.store.modals.editAccount.loading = false;
      }
    },
    async actionFavorites(account) {
      const success = await toggleFavorite(account, () => {
        this.store.emitFavoritesUpdate();
      });

      if (!success) {
        console.error('Operazione sui preferiti fallita');
      }
    },
    async actionUpdateAccount() {
      this.store.modals.editAccount.loading = true;

      if (!this.auth.profile.id) {
        this.store.modals.editAccount.loading = false;
        return;
      }

      try {
        // Usa la vault key già derivata durante il login
        const vaultKey = this.ensureVaultKey();

        const accountData = this.store.modals.editAccount.data;

        // Prepara i dati da aggiornare
        const updateData = {
          updated_at: new Date().toISOString(),
          name: accountData.name,
          email: accountData.email,
          username: accountData.username,
          notes: accountData.notes,
          password_expiration_date: this.store.modals.passwordExpiration.data.password_expiration_date,
          password_last_changed: new Date().toISOString(),
        };

        // Se la password è stata modificata, crittografala
        if (accountData.password && accountData.password.trim() !== '') {
          // Usa la nuova funzione con vault key derivata per crittografare la password
          const encryptionResult = encryptPasswordWithVaultKey(accountData.password, vaultKey);

          updateData.password = encryptionResult.encryptedPassword;
          updateData.password_salt = encryptionResult.passwordSalt;
        }

        // Aggiorna l'account nel database
        const { error } = await supabase.from('vault_entries').update(updateData).eq('id', accountData.id).eq('profile_id', this.auth.profile.id);

        if (!error) {
          this.store.modals.editAccount.open = false;
          await this.loadAccounts();

          this.store.modals.editAccount.data.name = '';
          this.store.modals.editAccount.data.username = '';
          this.store.modals.editAccount.data.email = '';
          this.store.modals.editAccount.data.password = '';
          this.store.modals.editAccount.data.notes = '';
          this.store.modals.editAccount.data.password_expiration_date = '';
          this.store.modals.passwordExpiration.data.password_expiration_date = '';
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.store.modals.editAccount.loading = false;
      }
    },
    async deleteAccount(account) {
      const success = await deleteAccount(account, async () => {
        await this.loadAccounts();
        this.store.modals.account.open = false;
      });

      if (!success) {
        console.error('Eliminazione fallita');
      }
    },
    async copyPasswordToClipboard() {
      const account = this.store.modals.account.data;

      try {
        const vaultKey = this.ensureVaultKey();

        let passwordToCopy;

        if (account.password_salt) {
          passwordToCopy = decryptPasswordWithVaultKey(account.password, vaultKey, account.password_salt);
        } else {
          passwordToCopy = decryptPasswordLegacy(account.password, vaultKey);
        }

        await navigator.clipboard.writeText(passwordToCopy);
        passwordToCopy = null;
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
    async togglePasswordVisibility(index = 0) {
      if (!this.store.security.isUnlocked && !this.store.security.vaultKey) {
        return;
      }

      const account = this.store.modals.account.data;

      if (account.showPassword) {
        this.clearAccountSensitiveData(account);
        account.showPassword = false;

        // Cancella il timer se esiste
        if (this.sensitiveDataTimers.has(index)) {
          clearTimeout(this.sensitiveDataTimers.get(index));
          this.sensitiveDataTimers.delete(index);
        }
        return; // Esci dalla funzione dopo aver nascosto la password
      }

      // Se la password non è visibile, mostrala
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

        const timeoutShowPassword = 10000; // 10 secondi
        this.setSensitiveDataTimer(account, index, timeoutShowPassword);
      } catch (e) {
        console.error(e);
      }
    },
  },
  watch: {
    'store.security.isUnlocked': {
      handler(value) {
        if (value && this.auth.profile) {
          this.loadAccounts();
        }
      },
      deep: true,
    },
    '$route.hash': {
      handler(value) {
        if (value && this.auth.profile) {
          const hashValue = value.replace('#', '');

          // Controlla se l'hash inizia con "edit-"
          if (hashValue.startsWith('edit-')) {
            const accountId = hashValue.replace('edit-', '');
            this.getAccountForEdit({ id: accountId });
          } else {
            // Hash normale per aprire il modal dell'account
            this.store.modals.account.id = hashValue;
            this.getAccount(hashValue);
          }
        }
      },
      immediate: true,
      deep: true,
    },

    'store.modals.account.open': {
      handler(value) {
        if (!value && this.$route.hash && !this.store.modals.editAccount.open) {
          // Rimuovi solo l'hash dalla URL corrente invece di fare push della stessa rotta
          this.$router.replace({
            path: this.$route.path,
            query: this.$route.query,
          });
        }
      },
      immediate: true,
      deep: true,
    },
    'store.modals.editAccount.open': {
      handler(value) {
        if (!value && this.$route.hash && this.$route.hash.includes('edit-')) {
          // Rimuovi l'hash quando il modal di edit si chiude
          this.$router.replace({
            path: this.$route.path,
            query: this.$route.query,
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },
  async mounted() {
    this.$router.push('/vault');

    this.handleResize();
    await this.getUser();

    if (this.auth.isAuthenticated) {
      await this.restoreVaultKey();
    }

    // Carica gli account solo se sbloccato E profilo disponibile
    if (this.store.security.isUnlocked && this.auth.profile) {
      // console.log('✅ Calling loadAccounts from mounted');
      await this.loadAccounts();
    } else {
      // console.log('❌ Not calling loadAccounts:');
    }

    window.addEventListener('load', () => {
      this.loading = false;
    });

    window.addEventListener('resize', this.handleResize);
  },
  beforeMount() {
    window.removeEventListener('load', () => {
      this.loading = false;
    });

    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style></style>
