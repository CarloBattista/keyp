import { createRouter, createWebHistory } from 'vue-router';
import { authMiddleware } from './middleware/authMiddleware';

const routes = [
  // OnBoard
  {
    path: '/identity/signup',
    name: 'signup',
    component: () => import('../views/Onboarding/Signup.vue'),
    props: true,
    meta: { title: 'Keyp • Sign up', requiresGuest: true },
  },
  {
    path: '/identity/signin',
    name: 'signin',
    component: () => import('../views/Onboarding/Signin.vue'),
    props: true,
    meta: { title: 'Keyp • Sign in', requiresGuest: true },
  },
  {
    path: '/identity/verify',
    name: 'verify',
    component: () => import('../views/Onboarding/Verify.vue'),
    props: true,
    meta: { title: 'Keyp', requiresGuest: true },
  },
  {
    path: '/identity/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/Onboarding/Forgot-password.vue'),
    props: true,
    meta: { title: 'Keyp', requiresGuest: true },
  },
  {
    path: '/identity/reset-password',
    name: 'reset-password',
    component: () => import('../views/Onboarding/Reset-password.vue'),
    props: true,
    meta: { title: 'Keyp', requiresGuest: true },
  },

  // General
  {
    path: '/',
    name: 'landing-page',
    component: () => import('../views/Landing/Landing-page.vue'),
    props: true,
    meta: { title: 'Keyp', requiresGuest: true },
  },
  {
    path: '/vault',
    name: 'vault',
    component: () => import('../views/Vault/Vault.vue'),
    props: true,
    meta: { title: 'Keyp', requiresAuth: true },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../views/Vault/Favorites.vue'),
    props: true,
    meta: { title: 'Keyp', requiresAuth: true },
  },

  // Error
  {
    path: '/not-found',
    name: 'not-found',
    component: () => import('../views/Fallback/Not-found.vue'),
    props: true,
    meta: { title: 'Keyp' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/not-found',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(authMiddleware);

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
