<template>
  <view class="appearance" v-if="show">
    <uni-list>
      <uni-list-item title="课程色块设置" clickable showArrow @click="navigateToColor"/>
      <view class="divider"></view>
      <uni-list-item title="显示网格辅助线">
      <template v-slot:footer>
        <switch color="#2979ff" :checked="showGridLines" @change="swichGridLines" />
      </template>
      </uni-list-item>
      <uni-list-item title="显示非本周课程">
        <template v-slot:footer>
          <switch color="#2979ff" :checked="showOtherWeek" @change="swichOtherWeek" />
        </template>
      </uni-list-item>
      <uni-list-item title="显示上课时间">
        <template v-slot:footer>
          <switch color="#2979ff" :checked="showStartTime" @change="swichStartTime" />
        </template>
      </uni-list-item>
      <uni-list-item title="显示下课时间">
        <template v-slot:footer>
          <switch color="#2979ff" :checked="showEndTime" @change="swichEndTime" />
        </template>
      </uni-list-item>
    </uni-list>
  </view>
</template>

<script>
import { useSettingStore } from '@/stores/modules/setting'

const settingStore = useSettingStore()

export default {
  data() {
    return {
      show: false,
      showGridLines: true,
      showOtherWeek: true,
      showStartTime: true,
      showEndTime: true,
    }
  },
  onLoad() {
    this.showGridLines = settingStore.settings.showGridLines
    this.showOtherWeek = settingStore.settings.showOtherWeek
    this.showStartTime = settingStore.settings.showStartTime
    this.showEndTime = settingStore.settings.showEndTime
  },
  mounted() {
    this.show = true
  },
  methods: {
    navigateToColor() {
      uni.navigateTo({
        url: '/pages/color/color'
      })
    },
    emit() {
      uni.$emit('swichAppearance')
    },
    swichGridLines(e) {
      settingStore.set({ showGridLines: e.detail.value })
      this.emit()
    },
    swichOtherWeek(e) {
      settingStore.set({ showOtherWeek: e.detail.value })
      this.emit()
    },
    swichStartTime(e) {
      settingStore.set({ showStartTime: e.detail.value })
      this.emit()
    },
    swichEndTime(e) {
      settingStore.set({ showEndTime: e.detail.value })
      this.emit()
    }
  }
}
</script>

<style scoped>
:deep(.uni-list-item) {
  height: 100rpx !important;
}

:deep(.uni-list) {
  border-top: none !important;
}

:deep(.uni-list-item__container) {
  height: 100% !important;
  padding: 0 30rpx !important;
}

:deep(.uni-list-item__content) {
  padding: 24rpx 0 !important;
}

:deep(.uni-list-item__content-title) {
  font-size: 30rpx;
  padding-left: 20rpx !important;
  padding-top: 10rpx !important;
}

:deep(.uni-list-item__extra) {
  height: 100% !important;
  line-height: 100rpx !important;
  display: flex !important;
  align-items: center !important;
}

:deep(switch) {
  transform: translateY(0) !important;
  position: relative !important;
  top: 0 !important;
  margin: auto 0 !important;
}

.divider {
  height: 20rpx;
  background-color: #f5f5f5;
}

.appearance {
  background-color: #f5f5f5;
  min-height: 100vh;
}

:deep(.uni-list) {
  border-top: none !important;
  background-color: #ffffff;
}
</style>
