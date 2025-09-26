<template>
  <div class="w-full h-12 flex items-center justify-start"></div>
  <div v-if="!showSecretKey" class="relative w-full">
    <div class="relative pt-6 max-w-[420px] mx-auto px-4 flex flex-col">
      <h1 class="text-[#222] text-3xl font-semibold text-center mb-8">Welcome to Keyp</h1>
      <form @submit.prevent class="w-full flex flex-col gap-4">
        <div class="w-full grid grid-cols-2 gap-4">
          <kyInput
            v-model="user.data.first_name"
            type="text"
            label="First name"
            forLabel="first_name"
            :error="user.error.first_name"
            :disabled="user.loading"
          />
          <kyInput
            v-model="user.data.last_name"
            type="text"
            label="Last name"
            forLabel="last_name"
            :error="user.error.last_name"
            :disabled="user.loading"
          />
        </div>
        <kyInput
          v-model="user.data.email"
          type="email"
          label="Email address"
          forLabel="email_address"
          :error="user.error.email"
          :disabled="user.loading"
        />
        <kyInput
          v-model="user.data.password"
          type="password"
          label="Password"
          forLabel="password"
          :error="user.error.password"
          :disabled="user.loading"
        />
        <kyButton @click="actionSignup" type="submit" variant="primary-core" label="Continue" :loading="user.loading" />
      </form>
      <div class="w-full mt-4 text-sm text-center flex flex-col gap-4 items-center justify-center">
        <p>Have account? <RouterLink to="/identity/signin" class="text-blue-500 hover:underline">Sign in</RouterLink></p>
      </div>
    </div>
  </div>
  <div v-else-if="showSecretKey" class="relative w-full pt-24 px-4">
    <div class="max-w-[420px] mx-auto p-6 rounded-lg flex flex-col gap-6 shadow-2xl shadow-black/20 border border-solid border-black/10 bg-white">
      <h3 class="text-[#222] text-3xl font-semibold text-center">Ottieni la tua Secret Key univoca</h3>
      <p class="text-[#222] text-base font-normal text-center">
        La Secret Key è generata dal tuo stesso dispositivo. È solo tua, non condividerla mai.
      </p>
      <kyButton @click="generateSecretKey" type="button" label="Genera la Secret Key" class="w-full" />
    </div>
  </div>
  <div v-if="generatedSecretKey" class="fixed top-0 left-0 w-full h-svh px-4 flex items-center justify-center bg-black/70">
    <div class="max-w-[420px] mx-auto p-6 rounded-lg flex flex-col gap-4 shadow-2xl shadow-black/20 border border-solid border-black/10 bg-white">
      <h3 class="text-[#222] text-2xl font-semibold text-center">Salva in backup la Secret Key per non perdere mai l'accesso</h3>
      <div class="w-full flex flex-col gap-2 items-center py-4 px-6 rounded-lg border border-dashed border-blue-200 bg-blue-200/30">
        <p class="text-[#222] text-xl font-semibold text-center">{{ partialSecretKey }}</p>
        <kyButton
          @click="downloadSecretKeyPDF"
          type="button"
          size="small"
          variant="secondary"
          leftIcon="Download"
          label="Salva il PDF"
          class="w-fit"
        />
      </div>
      <div class="w-full flex flex-col gap-2 items-center py-4 px-6 rounded-lg border border-solid border-orange-200 bg-orange-200/20">
        <p class="text-[#222] text-sm font-normal">
          Non teniamo registrata la tua Secret Key e non siamo in grado di recuperarla. Tienila sempre a portata.
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <input v-model="secretKeyConfirmed" type="checkbox" id="confirm" class="mr-2" />
          <label for="confirm" class="text-[#222] text-sm font-normal">Sono sicuro di aver salvato la Secret Key</label>
        </div>
        <kyButton @click="completeRegistration" type="button" label="Continua" :disabled="!secretKeyConfirmed" class="w-full" />
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../../lib/supabase';
import { auth } from '../../data/auth';
import { generateVaultSalt, generateSecretKey, generateSecretKeySalt, hashSecretKey } from '../../lib/crypto';
import { validateSignupForm, handleSignupErrors } from '../../lib/validation';
import jsPDF from 'jspdf';

// COMPONENTS
import kyInput from '../../components/input/ky-input.vue';
import kyButton from '../../components/button/ky-button.vue';

export default {
  name: 'Signup',
  components: {
    kyInput,
    kyButton,
  },
  data() {
    return {
      auth,
      showSecretKey: false,
      generatedSecretKey: '',
      secretKeyConfirmed: false,
      tempUser: null,

      user: {
        data: {
          first_name: '',
          last_name: '',
          email: '',
          password: '',
        },
        error: {
          first_name: null,
          last_name: null,
          email: null,
          password: null,
        },
        loading: false,
      },
    };
  },
  computed: {
    partialSecretKey() {
      if (!this.generatedSecretKey) return '';

      const parts = this.generatedSecretKey.split('-');
      if (parts.length < 2) return this.generatedSecretKey;

      // Mostra solo le prime due parti, il resto con punti
      const visibleParts = parts.slice(0, 2).join('-');
      const hiddenParts = parts
        .slice(2)
        .map(() => '••••••')
        .join(' ');

      return `${visibleParts} ${hiddenParts}`;
    },
  },
  methods: {
    validateForm() {
      const validation = validateSignupForm(this.user.data);
      this.user.error = validation.errors;
      return validation.isValid;
    },

    handleFormErrors(error) {
      this.user.error = handleSignupErrors(error);
    },

    generateSecretKey() {
      this.generatedSecretKey = generateSecretKey();
    },

    downloadSecretKeyPDF() {
      try {
        const doc = new jsPDF();

        // Configurazione del documento
        doc.setFontSize(20);
        doc.text('Keyp - Secret Key Backup', 20, 30);

        doc.setFontSize(12);
        doc.text('Data di generazione: ' + new Date().toLocaleDateString('it-IT'), 20, 50);
        doc.text('Nome: ' + this.user.data.first_name + ' ' + this.user.data.last_name, 20, 65);
        doc.text('Email: ' + this.user.data.email, 20, 80);

        // Linea separatrice
        doc.line(20, 90, 190, 90);

        // Secret Key
        doc.setFontSize(14);
        doc.text('La tua Secret Key:', 20, 110);

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(this.generatedSecretKey, 20, 130);

        // Avvertenze
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('IMPORTANTE:', 20, 160);
        doc.text('• Conserva questo documento in un luogo sicuro', 20, 175);
        doc.text('• Non condividere mai la tua Secret Key con nessuno', 20, 185);
        doc.text('• Keyp non può recuperare la tua Secret Key se la perdi', 20, 195);
        doc.text('• Questa chiave è necessaria per accedere al tuo vault', 20, 205);

        // Footer
        doc.setFontSize(8);
        doc.text('Generato automaticamente da Keyp - https://keyp.app', 20, 280);

        // Salva il PDF
        const fileName = `Keyp_SecretKey_${this.user.data.first_name}_${this.user.data.last_name}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      } catch (error) {
        console.error('Errore durante la generazione del PDF:', error);
        alert('Errore durante la generazione del PDF. Riprova.');
      }
    },

    async actionSignup() {
      this.user.error = {
        first_name: null,
        last_name: null,
        email: null,
        password: null,
      };

      if (!this.validateForm()) {
        this.user.loading = false;
        return;
      }

      this.user.loading = true;

      try {
        const { data, error } = await supabase.auth.signUp({
          email: this.user.data.email,
          password: this.user.data.password,
        });

        if (!error) {
          this.tempUser = data.user;
          this.showSecretKey = true;
        }
      } catch (e) {
        console.error(e);
        this.handleFormErrors(e);
      } finally {
        this.user.loading = false;
      }
    },

    async completeRegistration() {
      if (!this.secretKeyConfirmed || !this.tempUser) return;

      try {
        this.auth.user = this.tempUser;
        await this.createProfile(this.tempUser);

        // Nascondi il modal
        this.showSecretKey = false;

        this.$router.push({ name: 'signin' });
      } catch (e) {
        console.error(e);
      }
    },

    async createProfile(user) {
      if (!user.id) {
        return;
      }

      try {
        const vaultSalt = generateVaultSalt();
        const secretKeySalt = generateSecretKeySalt();
        const secretKeyHash = hashSecretKey(this.generatedSecretKey, secretKeySalt);

        const { error } = await supabase.from('profiles').insert({
          user_id: user.id,
          first_name: this.user.data.first_name,
          last_name: this.user.data.last_name,
          vault_salt: vaultSalt,
          secret_key_hash: secretKeyHash,
          secret_key_salt: secretKeySalt,
        });

        if (!error) {
          console.log('✅ Profilo creato con Secret Key');
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style scoped></style>
