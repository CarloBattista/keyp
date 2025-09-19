import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  // OnBoard
  {
    path: '/identity/signup',
    name: 'signup',
    component: () => import('../views/onBoard/Signup.vue'),
    props: true,
    meta: { title: 'Keyp • Signup' },
  },
  {
    path: '/identity/signin',
    name: 'signin',
    component: () => import('../views/onBoard/Signin.vue'),
    props: true,
    meta: { title: 'Keyp • Signin' },
  },

  // General
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    props: true,
    meta: { title: 'Keyp • Home' },
  },
  {
    path: '/vault',
    name: 'vault',
    component: () => import('../views/Vault.vue'),
    props: true,
    meta: { title: 'Keyp • Vault' },
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
