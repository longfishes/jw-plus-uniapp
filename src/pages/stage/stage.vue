<template>
  <!-- 正常内容区域 -->
  <uni-transition
    :show="stage.length > 0"
    :mode-class="['fade', 'slide-right']"
  >
    <view class="stage-list">
      <uni-card 
        v-for="(item, index) in reversedStage" 
        :key="index"
        :is-shadow="true"
        :class="{ 'current-stage': item.xqm == courseStage.xqm && item.xnm == courseStage.xnm }"
      >
        <view class="stage-card" @tap="handleStageTap(item)">
          <view class="stage-header">
            <text class="stage-title">{{ item.title }} {{ item.xqm == '3' ? '上' : '下' }}</text>
            <text 
              class="stage-tag" 
              v-if="item.xqm == courseStage.xqm && item.xnm == courseStage.xnm">
              当前学期
            </text>
          </view>
          
          <view class="stage-info">
            <view class="info-item">
              <text class="info-label">{{ item.startTime }}&nbsp;-&nbsp;{{ item.endTime }}</text>
            </view>
          </view>
        </view>
      </uni-card>
    </view>
  </uni-transition>

  <!-- 错误页面 -->
  <view class="error-page" v-if="error">
    <view class="error-content">
      <image class="error-image" src="/static/error.png" mode="aspectFit"></image>
      <text class="error-text">网络连接失败</text>
      <text class="error-sub-text">请检查网络后重试</text>
      <button class="retry-button" @click="retryLoad">重新加载</button>
    </view>
  </view>
</template>

<script>
import { http } from '@/utils/http'

export default {
  data() {
    return {
      stage: [],
      error: false,
      courseStage: {}
    }
  },
  computed: {
    reversedStage() {
      return [...this.stage].reverse()
    }
  },
  methods: {
    handleStageTap(item) {
      if (item.xqm == this.courseStage.xqm && item.xnm == this.courseStage.xnm) {
        return
      }
      this.courseStage = item
      uni.$emit('swichStage', item.xnm, item.xqm)
      uni.navigateBack()
    },
    async getStage() {
      this.error = false
      try {
        const res = await http({
          method: 'GET',
          url: '/kb/stage'
        }, false)
        this.stage = res.data
      } catch (e) {
        this.error = true
      }
    },
    retryLoad() {
      this.getStage()
    }
  },
  onLoad(options) {
    this.courseStage = options
    this.getStage()
  }
}
</script>

<style scoped lang="scss">
.error-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-text {
  font-size: 36rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.error-sub-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 60rpx;
}

.retry-button {
  width: 320rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background-color: #007AFF;
  color: #fff;
  font-size: 32rpx;
  text-align: center;
  
  &:active {
    opacity: 0.8;
  }
}

.stage-list {
  padding: 20rpx;
}

.stage-card {
  .stage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    margin-top: 10rpx;
    
    .stage-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .stage-tag {
      font-size: 24rpx;
      color: #007AFF;
      background-color: rgba(0, 122, 255, 0.1);
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
    }
  }
  
  .stage-info {
    .info-item {
      display: flex;
      margin-bottom: 16rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .info-label {
        font-size: 28rpx;
        color: #666;
      }
      
      .info-value {
        font-size: 28rpx;
        color: #333;
        flex: 1;
      }
    }
  }
}

.current-stage {
  :deep(.uni-card) {
    border: 2rpx solid #007AFF;
  }
}

// 卡片间距
:deep(.uni-card) {
  margin: 20rpx 0;
  
  &:first-child {
    margin-top: 0;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
