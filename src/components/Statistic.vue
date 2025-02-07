<template>
  <view class="floating-container" 
        v-if="isReady"
        :class="{ 'expanded': isExpanded }"
        :style="{ top: position.y + 'px' }"
        @touchstart.stop="touchStart"
        @touchmove.stop.prevent="touchMove"
        @touchend.stop="touchEnd">
    <!-- 主按钮 -->
    <view class="main-button">
      <uni-icons 
        :type="isExpanded ? 'closeempty' : 'bars'" 
        size="30" 
        color="#fff"
        class="icon"
      ></uni-icons>
    </view>
    
    <!-- 展开的内容 -->
    <view class="content-wrapper" v-show="isExpanded">
      <view class="content" :class="{ 'show': isExpanded }">
        <view class="stat-container">
          <view class="stat-item">
            <text class="stat-value">{{ gradeItem.xfjd || 0 }}</text>
            <text class="stat-label">平均绩点</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ avgScore || 0 }}</text>
            <text class="stat-label">平均分</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ totalCredit || 0 }}</text>
            <text class="stat-label">总学分</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Statistic',
  props: {
    gradeItem: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      isExpanded: false,
      position: { y: 0 },
      isDragging: false,
      startY: 0,
      startPos: 0,
      windowHeight: 0,
      isReady: false,
      moveDistance: 0
    }
  },
  mounted() {
    const windowInfo = uni.getWindowInfo();
    this.windowHeight = windowInfo.windowHeight;
    // 转换为 rpx 对应的 px 值
    this.position.y = this.windowHeight - uni.upx2px(200);
    this.isReady = true;
  },
  computed: {
    avgScore() {
        let totalScore = 0
        const len = this.gradeItem.list.length
        for (let i = 0; i < len; i++) {
            const cj = parseFloat(this.gradeItem.list[i].cj)
            if (cj == NaN || !cj) {
                continue
            }
            totalScore += cj
        }
        return Math.round(totalScore / len * 100) / 100
    },
    totalCredit() {
        let totalCredit = 0
        const len = this.gradeItem.list.length
        for (let i = 0; i < len; i++) {
            const xf = parseFloat(this.gradeItem.list[i].xf)
            if (xf == NaN || !xf) {
                continue
            }
            totalCredit += xf
        }
        return Math.round(totalCredit * 100) / 100
    },
  },
  methods: {
    touchStart(e) {
      this.isDragging = false;
      this.startY = e.touches[0].pageY;
      this.startPos = this.position.y;
      this.moveDistance = 0;
    },
    
    touchMove(e) {
      const currentY = e.touches[0].pageY;
      const deltaY = currentY - this.startY;
      this.moveDistance = Math.abs(deltaY);
      
      if (this.moveDistance > 5) {
        this.isDragging = true;
        if (this.isExpanded) {
          this.isExpanded = false;
          this.$emit('expand-change', false);
        }
      }
      
      if (this.isDragging) {
        let newY = this.startPos + deltaY;
        const maxY = this.windowHeight - uni.upx2px(200);  // 底部留出 200rpx
        const minY = uni.upx2px(250);  // 顶部留出 250rpx
        newY = Math.min(Math.max(newY, minY), maxY);
        this.position.y = newY;
      }
    },
    
    touchEnd() {
      if (this.moveDistance < 5) {
        this.isExpanded = !this.isExpanded;
        this.$emit('expand-change', this.isExpanded);
      }
      this.isDragging = false;
    }
  }
}
</script>

<style scoped lang="scss">
.floating-container {
  position: fixed;
  right: 30rpx;
  z-index: 998;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  touch-action: none;
}

.main-button {
  width: 100rpx;
  height: 100rpx;
  background-color: #2979ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.2);
  z-index: 999;
  
  .icon {
    transition: transform 0.3s ease;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.content-wrapper {
  position: absolute;
  right: 120rpx;
  width: 550rpx;
  height: 150rpx;
  z-index: 998;
}

.content {
  opacity: 0;
  transform: translateX(50rpx);
  transition: all 0.3s ease;
  background: #fff;
  padding: 0 40rpx;
  border-radius: 12rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.2);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  
  &.show {
    opacity: 1;
    transform: translateX(0);
  }

  .stat-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20rpx;

    .stat-value {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }

    .stat-label {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.expanded {
  .main-button {
    .icon {
      transform: rotate(180deg);
    }
  }
}
</style> 