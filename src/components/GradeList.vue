<template>
    <div class="grade-list-item" :style="{ borderColor: color }">
        <div class="left-content">
            <div class="title">{{ title }}</div>
            <div class="note">{{ note }}</div>
        </div>
        <div class="right-content">
            <div class="right-text" :style="{ color: color }">{{ rightText }}</div>
            <div class="right-note">绩点 {{ rightNote }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "GradeList",
    props: {
        title: {
            type: String,
            required: true
        },
        note: {
            type: String,
            required: true
        },
        rightText: {
            type: String,
            required: true
        },
        rightNote: {
            type: String,
            required: true
        }
    },
    computed: {
        color() {
            if ((this.rightText) >= 90 || this.rightText == '优秀') return '#19be6b';
            else if (this.rightText >= 60 || this.rightText == '良好') return '#2979ff';
            else return '#fa5151';
        }
    }
}
</script>

<style scoped>
.grade-list-item {
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

.title {
    font-size: 20px;
    color: black;
    text-align: left;
}

.note {
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

.right-text {
    font-size: 24px;
    font-weight: 600;
    text-align: center;
}

.right-note {
    font-size: 12px;
    color: gray;
    margin-top: 2px;
    text-align: right;
}
</style>
