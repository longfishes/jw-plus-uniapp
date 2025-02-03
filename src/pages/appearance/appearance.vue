<template>
  <view class="appearance" v-if="show">
    <view class="divider"></view>
    <uni-list>
      <uni-list-item title="课表背景设置" clickable showArrow @click="switchBackground"/>
      <uni-list-item title="课程色块设置" clickable showArrow @click="navigateToColor"/>
    </uni-list>
    <view class="divider"></view>
    <uni-list>
      <uni-list-item title="显示网格辅助线">
        <template v-slot:footer>
          <view class="switch-container">
            <switch color="#2979ff" :checked="showGridLines" @change="swichGridLines" />
          </view>
        </template>
      </uni-list-item>
      <uni-list-item title="显示非本周课程">
        <template v-slot:footer>
          <view class="switch-container">
            <switch color="#2979ff" :checked="showOtherWeek" @change="swichOtherWeek" />
          </view>
        </template>
      </uni-list-item>
      <uni-list-item title="显示上课时间">
        <template v-slot:footer>
          <view class="switch-container">
            <switch color="#2979ff" :checked="showStartTime" @change="swichStartTime" />
          </view>
        </template>
      </uni-list-item>
      <uni-list-item title="显示下课时间">
        <template v-slot:footer>
          <view class="switch-container">
            <switch color="#2979ff" :checked="showEndTime" @change="swichEndTime" />
          </view>
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
  onHide() {
    this.submit()
  },
  onUnload() {
    this.submit()
  },
  methods: {
    submit() {
      settingStore.set({
        showGridLines: this.showGridLines,
        showOtherWeek: this.showOtherWeek,
        showStartTime: this.showStartTime,
        showEndTime: this.showEndTime,
      })
      uni.$emit('swichAppearance')
    },
    navigateToColor() {
      uni.navigateTo({
        url: '/pages/color/color'
      })
    },
    switchBackground() {
      uni.navigateTo({
        url: '/pages/background/background'
      })
    },
    swichGridLines(e) {
      this.showGridLines = e.detail.value
    },
    swichOtherWeek(e) {
      this.showOtherWeek = e.detail.value
    },
    swichStartTime(e) {
      this.showStartTime = e.detail.value
    },
    swichEndTime(e) {
      this.showEndTime = e.detail.value
    }
  }
}
</script>

<style scoped>
:deep(.uni-list) {
  background-color: #ffffff;
}

:deep(.uni-list-item) {
  height: 100rpx;
}

:deep(.uni-list-item__container) {
  height: 100%;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
}

:deep(.uni-list-item__content) {
  flex: none;
  display: flex;
  align-items: center;
}

:deep(.uni-list-item__content-title) {
  font-size: 30rpx;
  padding-left: 20rpx;
  line-height: 1;
}

.switch-container {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.divider {
  height: 20rpx;
  background-color: #f5f5f5;
}

.appearance {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>
