<template>
    <view class="progress">
        <view 
            class="progress__track"
            @touchstart="handleTrackClick"
        >
            <view 
                class="progress__fill" 
                :style="{
                    width: `${((tempValue - 1) / (max - 1)) * 90 + 5}%`,
                    backgroundColor: color
                }"
            ></view>
            <view 
                class="progress__thumb"
                :style="{ left: `${((tempValue - 1) / (max - 1)) * 90 + 5}%` }"
                @touchstart.stop="handleThumbStart"
                @touchmove.stop="handleThumbMove"
                @touchend.stop="handleThumbEnd"
            >
                <text 
                    class="progress__value"
                    :style="{ color: color }"
                >{{ tempValue }}</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'Progress',
    props: {
        // 当前值
        value: {
            type: Number,
            default: 1,
            validator: value => value >= 1
        },
        // 最大值
        max: {
            type: Number,
            default: 100,
            validator: value => value >= 1
        },
        // 进度条颜色
        color: {
            type: String,
            default: '#2979ff'
        }
    },
    computed: {
        currentValue() {
            return Math.round(this.value)
        }
    },
    emits: ['update:value'],
    methods: {
        // 获取进度条轨道的位置信息
        getTrackRect() {
            return new Promise(resolve => {
                uni.createSelectorQuery()
                    .in(this)
                    .select('.progress__track')
                    .boundingClientRect(data => {
                        resolve(data)
                    })
                    .exec()
            })
        },
        // 点击轨道更新进度
        async handleTrackClick(e) {
            const rect = await this.getTrackRect()
            const offsetX = e.touches[0].clientX - rect.left
            const percentage = offsetX / rect.width
            const newValue = Math.round((percentage - 0.05) / 0.9 * (this.max - 1) + 1)
            const finalValue = Math.max(1, Math.min(this.max, newValue))
            this.tempValue = finalValue
            this.$emit('update:value', finalValue)
        },
        // 开始拖动滑块
        handleThumbStart(e) {
            this.isDragging = true
            this.startX = e.touches[0].clientX
            this.startValue = this.tempValue
        },
        // 拖动滑块
        async handleThumbMove(e) {
            if (!this.isDragging) return
            const rect = await this.getTrackRect()
            const deltaX = e.touches[0].clientX - this.startX
            const deltaPercentage = deltaX / rect.width
            const deltaValue = deltaPercentage / 0.9 * (this.max - 1)
            const newValue = Math.round(this.startValue + deltaValue)
            this.tempValue = Math.max(1, Math.min(this.max, newValue))
        },
        // 结束拖动
        handleThumbEnd() {
            this.isDragging = false
            this.$emit('update:value', this.tempValue)
        }
    },
    data() {
        return {
            isDragging: false,
            startX: 0,
            startValue: 1,
            tempValue: 1
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(val) {
                this.tempValue = val
            }
        }
    }
}
</script>

<style scoped>
.progress {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 40rpx;
    box-sizing: border-box;
}

.progress__track {
    position: relative;
    flex: 1;
    height: 32rpx;
    background-color: #eee;
    border-radius: 100rpx;
    overflow: visible;
}

.progress__fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    border-radius: 100rpx;
    transition: width 0.5s ease;
}

.progress__thumb {
    position: absolute;
    top: 50%;
    width: 80rpx;
    height: 60rpx;
    background-color: #fff;
    border-radius: 30rpx;
    transform: translate(-50%, -50%);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
    z-index: 1;
    transition: left 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.progress__value {
    font-size: 24rpx;
    font-weight: bold;
}
</style>