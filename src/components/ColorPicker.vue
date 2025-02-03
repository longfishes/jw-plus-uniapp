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
          v-if="colors.length < 20"
          class="color-block color-block--empty" 
          @tap="$emit('add')"
        >
          <uni-icons type="plusempty" color="#2979ff" size="24" />
        </view>
      </view>
    </view>

    <!-- 调色板组件 -->
    <uni-popup 
      ref="colorPalette" 
      type="bottom"
      :safeArea="false"
      :style="{ paddingBottom: '120rpx' }"
      @maskClick="handleMaskClick"
    >
      <ColorPalette
        ref="palette"
        :model-value="colors[selectedIndex]"
        @update:modelValue="handleUpdateModelValue"
        @close="handleClose"
      />
    </uni-popup>

    <view class="current-color-display" @tap="showColorPalette">
      <text class="color-hex">{{ colors[selectedIndex] || '#000000' }}</text>
      <view 
        class="color-preview" 
        :class="{ 'color-preview--empty': selectedIndex === -1 }"
        :style="selectedIndex !== -1 ? { backgroundColor: colors[selectedIndex] } : {}"
      ></view>
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
import ColorPalette from '@/components/ColorPalette.vue'

export default {
  components: {
    ColorPalette
  },
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

  data() {
    return {
      currentColor: '#4A90E2'
    }
  },

  methods: {
    handleClose() {
      this.$refs.colorPalette.close()
    },
    handleUpdateModelValue(color) {
      if (this.selectedIndex !== -1) {
        this.colors[this.selectedIndex] = color
      }
    },
    selectColor(index) {
      if (index === this.selectedIndex) {
        this.$emit('update:selectedIndex', -1)
      } else {
        this.$emit('update:selectedIndex', index)
        this.currentColor = this.colors[index]
      }
    },

    showColorPalette() {
        if (this.selectedIndex === -1) return
        this.$refs.colorPalette.open()
    },

    handleMaskClick() {
      this.$refs.palette.onCancel()
    },

  },

  watch: {
    selectedIndex(newVal) {
      if (newVal !== -1) {
        this.currentColor = this.colors[newVal]
      }
    }
  },

  computed: {
    canAddMore() {
      return this.colors.length < 20 // 5列 * 4行 = 20个色块
    }
  }
}
</script>

<style scoped>
.color-picker-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

/* 修改当前颜色显示区域的样式 */
.current-color-display {
  position: fixed;
  bottom: 400rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 20rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.color-hex {
  font-size: 24rpx;
  color: #666666;
}

.color-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  border: 2rpx solid #e0e0e0;
}

.color-preview--empty {
  border: 4rpx dashed #2979ff;
  background-color: transparent !important;
}
</style>
