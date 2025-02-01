<template>
    <view class="grade-list-item" :style="{ borderColor: color, backgroundColor: bg }">
        <view class="left-content">
            <uni-badge text="新" absolute="rightTop" size="small" :offset="[1, 3]" v-if="isNew">
                <view class="kcmc" :style="{ color: textColor }">{{ kcmc }}</view>
            </uni-badge>
            <view class="kcmc" :style="{ color: textColor }" v-else>{{ kcmc }}</view>
            <view class="message">{{ message }}</view>
        </view>
        <view class="right-content">
            <view class="cj" :style="{ color: color }">{{ cj }}</view>
            <view class="jd">绩点 {{ jd }}</view>
        </view>
    </view>
</template>

<script>
export default {
    name: "GradeList",
    props: {
        kcmc: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        cj: {
            type: String,
            required: true
        },
        jd: {
            type: String,
            required: true
        },
        isNew: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        color() {
            if (this.jd >= 4) return '#19be6b';
            else if (this.jd >= 1) return '#2979ff';
            return '#fa5151';
        },
        bg() {
            if (this.jd < 1) return '#fde2e2'
            return ''
        },
        textColor() {
            if (this.jd < 1) return '#fa5151'
            return 'black'
        }
    }
}
</script>

<style scoped>
.grade-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 20rpx;
    border: 1px solid;
    border-radius: 16rpx;
    margin: 30rpx;
}

.left-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.kcmc {
    font-size: 40rpx;
    color: black;
    text-align: left;
}

.message {
    font-size: 24rpx;
    color: gray;
    text-align: left;
    margin-top: 10rpx;
}

.right-content {
    width: 200rpx;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.cj {
    font-size: 48rpx;
    font-weight: bold;
    text-align: center;
}

.jd {
    font-size: 24rpx;
    color: gray;
    margin-top: 4rpx;
    text-align: right;
}
</style>
