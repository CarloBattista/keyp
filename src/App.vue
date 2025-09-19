<template>
  <div>
    <RouterView />
    <div
      v-if="ENV === 'debug'"
      class="fixed z-[99999] top-3 right-3 p-2 px-4 font-semibold uppercase border border-dashed border-red-500 bg-red-500/30"
    >
      {{ ENV === 'debug' ? 'In testing environment' : 'in production environment' }}
    </div>
  </div>
</template>

<script>
import { supabase } from './lib/supabase';
import { auth } from './data/auth';

export default {
  name: 'App',
  data() {
    return {
      auth,
      ENV: import.meta.env.VITE_ENV,
    };
  },
  methods: {
    async getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (!error) {
          // console.log(data);

          this.auth.user = data.user;
          this.auth.isAuthenticated = true;

          localStorage.setItem('isAuthenticated', true);

          this.getSession();
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
          // console.log(data);
          this.auth.profile = data;
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  watch: {
    'auth.user': {
      handler(value) {
        if (value) {
          this.getSession();
          this.getProfile();
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.getUser();

    window.addEventListener('load', () => {
      this.loading = false;
    });
  },
  beforeMount() {
    window.removeEventListener('load', () => {
      this.loading = false;
    });
  },
};
</script>

<style></style>
