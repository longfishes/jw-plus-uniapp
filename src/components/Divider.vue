<template>
    <view class="divider-container">
        <view class="divider-text">暂无更多数据</view>
    </view>
</template>

<script>
export default {
    name: "Divider",
    props: {
        text: {
            type: String,
            required: true
        },
    },
}
</script>

<style scoped lang="scss">
.divider-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 50rpx;
    padding-bottom: 50rpx;
    position: relative;
}

.divider-container::before,
.divider-container::after {
    content: '';
    flex: 1;
    height: 1rpx;
    background-color: #e0e0e0;
}

.divider-text {
    padding: 0 20rpx;
    font-size: 24rpx;
    color: #999;
    white-space: nowrap;
}
</style>