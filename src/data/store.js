import { reactive } from 'vue';

export const store = reactive({
  accounts: {
    data: null,
    error: null,
    loading: false,
  },

  modals: {
    newAccount: {
      data: {
        name: 'Test',
        username: '',
        email: 'test@gmail.com',
        password: 'carlone',
        notes: 'This is only for developing',
      },
      error: {
        name: null,
        username: null,
        email: null,
        password: null,
        notes: null,
      },
      open: false,
      loading: false,
    },
  },
});
