<template>
  <page-meta :page-style="'overflow:hidden'"></page-meta>

  <ColorPicker v-if="show" v-model:selectedIndex="selectedIndex" :colors="colors" @delete="handleDelete"
    @reset="handleReset" @save="handleSave" @add="handleAdd" />
</template>

<script>
import ColorPicker from '@/components/ColorPicker.vue'
import { useSettingStore } from '@/stores/modules/setting'
import { defaultColors } from '@/config/defaults'
const settingStore = useSettingStore()

export default {
  components: {
    ColorPicker
  },

  data() {
    return {
      selectedIndex: -1,
      colors: [...defaultColors],
      show: false
    }
  },
  onLoad() {
    this.colors = [...(settingStore.settings.colors || this.colors)]
  },
  mounted() {
    this.show = true
  },
  methods: {
    handleDelete() {
      if (this.selectedIndex !== -1) {
        this.colors.splice(this.selectedIndex, 1)
        this.selectedIndex = -1
      }
    },

    handleReset() {
      uni.showModal({
        title: '提示',
        content: '确认还原到默认色块？',
        success: (res) => {
          if (res.confirm) {
            this.colors = [...defaultColors]
            this.selectedIndex = -1
          }
        },
      })
    },

    handleSave() {
      settingStore.set({ colors: this.colors })
      uni.$emit('swichAppearance')
      uni.navigateBack()
    },

    handleAdd() {
      this.colors.push('#2979ff')
    }
  }
}
</script>