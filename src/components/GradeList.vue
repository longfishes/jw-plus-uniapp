<template>
    <div class="grade-list-item" :style="{ borderColor: color }">
        <div class="left-content">
            <div class="kcmc">{{ kcmc }}</div>
            <div class="message">{{ message }}</div>
        </div>
        <div class="right-content">
            <div class="cj" :style="{ color: color }">{{ cj }}</div>
            <div class="jd">绩点 {{ jd }}</div>
        </div>
    </div>
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
        }
    },
    computed: {
        color() {
            if ((this.cj) >= 90 || this.cj == '优秀') return '#19be6b';
            else if (this.cj >= 60 || this.cj == '良好') return '#2979ff';
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
    font-weight: 600;
    text-align: center;
}

.jd {
    font-size: 12px;
    color: gray;
    margin-top: 2px;
    text-align: right;
}
</style>
