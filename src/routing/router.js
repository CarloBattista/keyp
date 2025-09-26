import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  // OnBoard
  {
    path: '/identity/signup',
    name: 'signup',
    component: () => import('../views/Onboarding/Signup.vue'),
    props: true,
    meta: { title: 'Keyp • Sign up' },
  },
  {
    path: '/identity/signin',
    name: 'signin',
    component: () => import('../views/Onboarding/Signin.vue'),
    props: true,
    meta: { title: 'Keyp • Sign in' },
  },
  {
    path: '/identity/verify',
    name: 'verify',
    component: () => import('../views/Onboarding/Verify.vue'),
    props: true,
    meta: { title: 'Keyp' },
  },
  {
    path: '/identity/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/Onboarding/Forgot-password.vue'),
    props: true,
    meta: { title: 'Keyp' },
  },
  {
    path: '/identity/reset-password',
    name: 'reset-password',
    component: () => import('../views/Onboarding/Reset-password.vue'),
    props: true,
    meta: { title: 'Keyp' },
  },

  // General
  {
    path: '/vault',
    name: 'vault',
    component: () => import('../views/Vault/Vault.vue'),
    props: true,
    meta: { title: 'Keyp' },
  },
  {
    path: '/edit-vault/:id',
    name: 'edit-vault',
    component: () => import('../views/Vault/Vault-edit.vue'),
    props: true,
    meta: { title: 'Keyp' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const pageTitle = to.meta.title;
  if (pageTitle) {
    document.title = pageTitle;
  } else {
    document.title = 'Keyp';
  }
  next();
});

export default router;
