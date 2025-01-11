<template>
    <view class="exam-list-item" :style="{ borderColor: color, backgroundColor: bg }">
        <view class="left-content">
            <uni-badge text="新" absolute="rightTop" size="small" :offset="[1, 1]" v-if="isNew">
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
    name: "ExamList",
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
            return '#2979ff'
        },
        bg() {
            return ''
        },
        textColor() {
            return 'black'
        }
    }
}
</script>

<style scoped>
.exam-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid;
    border-radius: 8px;
    margin: 15px;
}

.left-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.kcmc {
    font-size: 20px;
    color: black;
    text-align: left;
}

.message {
    font-size: 12px;
    color: gray;
    text-align: left;
    margin-top: 5px;
}

.right-content {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.cj {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
}

.jd {
    font-size: 12px;
    color: gray;
    margin-top: 2px;
    text-align: right;
}
</style>
