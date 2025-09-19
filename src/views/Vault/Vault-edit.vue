<template>
  <div>{{ vault.data?.email }}</div>
</template>

<script>
import { supabase } from '../../lib/supabase';

export default {
  name: 'Edit-vault',
  data() {
    return {
      vault_id: this.$route.params.id,

      vault: {
        data: null,
        error: false,
        loading: false,
      },
    };
  },
  methods: {
    async getAccount() {
      this.vault.loading = true;

      try {
        const { data, error } = await supabase.from('vault_entries').select('*').eq('id', this.vault_id).single();

        if (!error) {
          //   console.log(data);
          this.vault.data = data;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.vault.loading = false;
      }
    },
  },
  watch: {
    vault_id: {
      handler(value) {
        if (value) {
          this.getAccount();
        }
      },
      deep: true,
    },
  },
  async mounted() {
    await this.getAccount();
  },
};
</script>

<style scoped></style>
