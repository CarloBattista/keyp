import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // General
  {
    path: "/",
    name: "home",
    component: () => import("../views/Home.vue"),
    props: true,
    meta: { title: "Keyp • Home" },
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
    document.title = "Keyp";
  }
  next();
});

export default router;
