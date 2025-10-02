<template>
  <div @click.stop class="absolute z-[9991] left-0 top-full mt-2 w-full sm:w-96">
    <div class="w-full p-2 rounded-[20px] border border-solid border-black/10 bg-white shadow-2xl shadow-black/15">
      <!-- Float Body -->
      <div class="w-full p-4 md:p-5">
        <slot name="body" />
      </div>
      <!-- Float Footer -->
      <div class="flex items-center justify-end gap-3">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'float-menu',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      required: true,
    },
  },
};
</script>
