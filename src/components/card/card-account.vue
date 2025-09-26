<template>
  <div class="card-account relative w-full rounded-3xl px-2.5 py-2 flex gap-3 items-center justify-between overflow-hidden" :class="{ added: add }">
    <div class="flex gap-3 items-center justify-start">
      <img
        v-if="!add"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn-NpXvV76-BhqVlwiT8Ql0PoGcSJ-ZOhllA&s"
        alt="Account image"
        class="image-blurred"
      />
      <div class="account-image relative h-16 aspect-square rounded-2xl bg-[#e8e8e8]">
        <img
          v-if="!add"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn-NpXvV76-BhqVlwiT8Ql0PoGcSJ-ZOhllA&s"
          alt="Account image"
          class="nrm z-20 w-full h-full rounded-2xl object-cover"
        />
      </div>
      <div class="account-data relative flex flex-col">
        <h2 class="text-black text-xl font-semibold">{{ data?.name || 'Account senza nome' }}</h2>
        <p class="text-[#999] text-sm font-normal">{{ data?.email || 'example@gmail.com' }}</p>
      </div>
    </div>
    <div class="flex items-center justify-end"></div>
  </div>
</template>

<script>
export default {
  name: 'card-account',
  props: {
    add: {
      type: Boolean,
      default: false,
    },
    data: Object,
  },
};
</script>

<style scoped>
.card-account {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.card-account.added {
  border: 1px dashed #e8e8e8;
}

.card-account .image-blurred {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  height: 100%;
  filter: blur(64px);
  opacity: 0.5;
}

.account-image,
.account-data {
  z-index: 20;
}
</style>
