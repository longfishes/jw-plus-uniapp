<template>
  <view class="color-palette">
    <!-- 主色板 -->
    <view class="main-palette" ref="palette">
      <view class="color-grid">
        <view v-for="(row, rowIndex) in colorMatrix" :key="rowIndex" class="color-row">
          <view v-for="(color, colIndex) in row" 
               :key="colIndex" 
               class="color-cell"
               :style="{ backgroundColor: color }"
               @tap="selectColor(color)">
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作区 -->
    <view class="bottom-actions">
      <view class="current-color" :style="{ backgroundColor: isValidColor ? tempColor : modelValue }"></view>
      <view class="hex-input-wrap" :class="{ 'hex-input-wrap--invalid': !isValidColor }">
        <text class="hex-prefix">#</text>
        <input 
          class="hex-input" 
          type="text" 
          v-model="hexValue" 
          placeholder="000000"
          maxlength="6"
        />
      </view>
      <view class="button-group">
        <button class="action-btn cancel-btn" @tap="onCancel">取消</button>
        <button class="action-btn confirm-btn" @tap="onConfirm">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ColorPalette',
  props: {
    modelValue: {
      type: String,
      default: '#4A90E2'
    }
  },
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      colorMatrix: [],
      hexValue: this.modelValue.replace('#', ''),
      tempColor: this.modelValue,
      isValidColor: true
    }
  },
  mounted() {
    this.generateColorMatrix()
  },
  methods: {
    generateColorMatrix() {
      const rows = 8
      const cols = 12
      this.colorMatrix = []
      
      for (let i = 0; i < rows; i++) {
        const row = []
        for (let j = 0; j < cols; j++) {
          const hue = Math.round((j / cols) * 360)
          const saturation = 100
          const lightness = Math.round(50 + (i / rows) * 50)
          
          // 直接计算 HSL 到 RGB 的转换
          const rgb = this.hslToRgb(hue, saturation, lightness)
          const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b)
          row.push(hex)
        }
        this.colorMatrix.push(row)
      }
    },
    validateHexColor(hex) {
      // 验证6位十六进制颜色值
      const reg = /^[0-9A-Fa-f]{6}$/
      return reg.test(hex)
    },
    updateTempColor(hex) {
      if (this.validateHexColor(hex)) {
        this.tempColor = '#' + hex
        this.isValidColor = true
      } else {
        this.isValidColor = false
      }
    },
    selectColor(color) {
      this.tempColor = color
      this.hexValue = color.replace('#', '')
      this.isValidColor = true
    },
    // HSL 转 RGB
    hslToRgb(h, s, l) {
      s /= 100
      l /= 100
      const k = n => (n + h / 30) % 12
      const a = s * Math.min(l, 1 - l)
      const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
      return {
        r: Math.round(255 * f(0)),
        g: Math.round(255 * f(8)),
        b: Math.round(255 * f(4))
      }
    },
    // RGB 转 HEX
    rgbToHex(r, g, b) {
      const toHex = x => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    },
    onCancel() {
      this.tempColor = this.modelValue
      this.hexValue = this.modelValue.replace('#', '')
      this.$emit('close')
    },
    onConfirm() {
      if (!this.isValidColor) {
        return
      }
      const color = '#' + this.hexValue
      this.$emit('update:modelValue', color)
      this.$emit('close')
    }
  },
  watch: {
    modelValue: {
      handler(newVal) {
        this.hexValue = newVal.replace('#', '')
        this.tempColor = newVal
        this.isValidColor = true
      },
      immediate: true
    },
    hexValue: {
      handler(newVal) {
        this.updateTempColor(newVal)
      }
    }
  }
}
</script>

<style scoped>
.color-palette {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
}

.main-palette {
  width: 100%;
  aspect-ratio: 12/8; /* 与颜色矩阵的列数/行数比例相同 */
  position: relative;
  margin-bottom: 20px;
  border-radius: 4px;
  overflow: hidden;
}

.color-grid {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.color-row {
  display: flex;
  flex: 1;
}

.color-cell {
  flex: 1;
  aspect-ratio: 1/1; /* 保持正方形 */
}

.bottom-actions {
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
}

.current-color {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.hex-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
}

.hex-prefix {
  color: #666;
  font-size: 24rpx;
  margin-right: 4rpx;
}

.hex-input {
  width: 120rpx;
  height: 48rpx;
  font-size: 24rpx;
  background-color: transparent;
}

.button-group {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  min-width: 120rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  border-radius: 30rpx;
  font-size: 24rpx;
  padding: 0 20rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #2979ff;
  color: #fff;
}

.action-btn:after {
  border: none;
}

.hex-input-wrap--invalid {
  border: 1px solid #f56c6c;
}

.hex-input-wrap--invalid .hex-prefix,
.hex-input-wrap--invalid .hex-input {
  color: #f56c6c;
}
</style>
