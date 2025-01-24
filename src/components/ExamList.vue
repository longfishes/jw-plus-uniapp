<template>
    <view class="exam-list-item" :style="{ borderColor: color, backgroundColor: bg }">
        <view class="left-content">
            <view class="kcmc">{{ kcmc }}</view>
            <view class="message"><uni-icons type="location" size="15" /> {{ location }}</view>
            <view class="message">
                <uni-icons type="calendar" size="15" /> {{ date }}
                <uni-icons custom-prefix="iconfont" type="icon-shizhong" size="13" /> {{ time }}
            </view>
        </view>
        <view class="right-content">
            <uni-tag :circle="true" :text="tagText" :type="tagType" size="normal" custom-style="font-weight: bold;" />
        </view>
    </view>
</template>

<script>
function split(str) {
    const match = str.match(/^(\d{4}-\d{2}-\d{2})\((\d{2}:\d{2}-\d{2}:\d{2})\)$/);
    return {
        date: match[1],
        time: match[2]
    };
}

export default {
    name: "ExamList",
    props: {
        kcmc: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        datetime: {
            type: String,
            required: true
        },
    },
    computed: {
        diff() {
            return Math.round((new Date(this.date) - new Date()) / (24 * 60 * 60 * 1000));
        },
        date() {
            return split(this.datetime).date;
        },
        time() {
            return split(this.datetime).time;
        },
        endTime() {
            const endTimeStr = split(this.datetime).time.split('-')[1];
            const isoEndTimeStr = `${this.date}T${endTimeStr}:00`;
            return new Date(isoEndTimeStr);
        },
        color() {
            if (this.endTime < new Date()) return '#8f939c';
            else if (this.diff <= 3) return '#fa5151'
            return '#2979ff';
        },
        bg() {
            if (this.endTime >= new Date() && this.diff <= 3) return '#fde2e2';
            return '';
        },
        tagType() {
            if (this.endTime < new Date()) return undefined;
            else if (this.diff <= 3) return 'error'
            return 'primary';
        },
        tagText() {
            if (this.endTime < new Date()) return '过去' + (-this.diff) + '天';
            else if (this.diff <= 3) return '仅剩' + this.diff + '天'
            return '还剩' + this.diff + '天';
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
    width: 120px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.cj {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
}
</style>
