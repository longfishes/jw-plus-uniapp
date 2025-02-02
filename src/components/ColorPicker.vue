<template>
  <view class="color-picker-container">
    <view class="color-picker">
      <view class="color-row">
        <template v-for="(color, index) in colors" :key="index">
          <view
            class="color-block"
            :class="{ 'color-block--selected': selectedIndex === index }"
            :style="{ backgroundColor: color }"
            @tap="selectColor(index)"
          >
            <uni-icons 
              v-if="selectedIndex === index" 
              type="checkmarkempty" 
              color="#ffffff" 
              size="24"
            />
          </view>
        </template>
        <view 
          class="color-block color-block--empty" 
          @tap="$emit('add')"
        >
          <uni-icons type="plusempty" color="#2979ff" size="24" />
        </view>
      </view>
    </view>

    <!-- 操作栏 -->
    <view class="action-bar">
      <view class="action-group" :class="{ 'action-group--two': selectedIndex === -1 }">
        <button 
          v-if="selectedIndex !== -1" 
          class="action-btn delete-btn" 
          @tap="$emit('delete')"
        >删除</button>
        <button class="action-btn reset-btn" @tap="$emit('reset')">还原</button>
        <button class="action-btn save-btn" @tap="$emit('save')">保存</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ColorPicker',
  
  props: {
    colors: {
      type: Array,
      required: true
    },
    selectedIndex: {
      type: Number,
      default: -1
    }
  },

  methods: {
    selectColor(index) {
      if (index === this.selectedIndex) {
        this.$emit('update:selectedIndex', -1)
      } else {
        this.$emit('update:selectedIndex', index)
      }
    }
  }
}
</script>

<style scoped>
.color-picker-container {
  background-color: #ffffff;
}

.color-picker {
  padding: 0;
  padding-bottom: 500rpx;
}

.color-row {
  display: flex;
  flex-wrap: wrap;
}

.color-block {
  width: 20%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-block--selected {
  border: 4rpx dashed #ffffff;
}

.action-bar {
  position: fixed;
  bottom: 300rpx;
  left: 0;
  right: 0;
  display: flex;
  padding: 0 30rpx;
  justify-content: space-between;
  background-color: transparent;
}

.action-group {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.action-group--two {
  padding: 0 100rpx;
}

.action-btn {
  min-width: 180rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: none;
  padding: 0 40rpx;
}

.delete-btn {
  background-color: #f56c6c;
}

.reset-btn, .save-btn {
  background-color: #2979ff;
}

.action-btn:after {
  border: none;
}

.color-block--empty {
    position: relative;
    background-color: transparent !important;
    box-sizing: border-box;
}

.color-block--empty::after {
    content: '';
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    bottom: 8rpx;
    left: 8rpx;
    border: 4rpx dashed #2979ff;
    box-sizing: border-box;
}

.color-block--empty .uni-icons {
    position: relative;
    z-index: 1;
}
</style>
