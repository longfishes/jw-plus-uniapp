<template>
    <view class="container">
        <cu-custom bgColor="bg-white" customBack="{{true}}" @back="update">
            <view slot="backText">
                <!-- <image @click="update" class="refresh-btn" src="/asset/imgs/refresh.png" mode="aspectFill"></image> -->
            </view>
            <view slot="content">
                <view @click="selectWeek"><text>第{{ nowWeek }}周</text> <text class="cuIcon-unfold"></text></view>
            </view>
        </cu-custom>
        <view class="week-list">
            <view class="now-month">
                <text>{{ nowMonth < 10 ? '0' + nowMonth : nowMonth }}</text>
                        <text>月</text>
            </view>
            <view class="week-item" v-for="(item, index) in weekDayCount" :key="index"
                :class="{ 'active': nowMonth == todayMonth && todayDay == weekCalendar[index] }">
                <text class="week-name">周{{ weekIndexText[index] }}</text>
                <text class="week-date">{{ weekCalendar[index] == 1 ? ((nowMonth == 12 ? 1 : (nowMonth + 1)) + '月')
            : (weekCalendar[index] < 9 ? '0' : '') + weekCalendar[index] + '日' }}</text>
            </view>
        </view>
        <view class="course-content">
            <view class="course-nums">
                <view class="course-num" v-for="(num, index) in 10" :key="index">
                    {{ index + 1 > 9 ? index + 1 : '0' + (index + 1) }}
                </view>
            </view>
            <swiper :duration="300" circular class="course-swpier" :current="nowWeek - 1" @change="swiperSwitchWeek"
                @touchstart="onTouchStart" @touchend="onTouchEnd">
                <swiper-item v-for="(item, weekIndex) in totalWeek" :key="weekIndex">
                    <view class="course-list">
                        <view v-if="courseList.length > 0" class="course-item" v-for="(course, index) in courseList"
                            :key="course.kch_id"
                            :style="{ top: `${windowWidth / 7 * (index * 2)}px`, left: '0', height: `${windowWidth / 7 * 2}px` }">
                            <view class="course-item__content" :style="{ backgroundColor: courseColor[course.kcmc] }">
                                {{ course.kcmc }}@{{ course.cdmc }}<br>
                                {{ xqjmcMap[course.xqj] }} - {{ course.jc }}
                            </view>
                        </view>
                    </view>
                </swiper-item>
            </swiper>
        </view>
        <!-- <van-popup v-model="showSwitchWeek" position="bottom" @close="hideSwitchWeek" round>
            <view class="switch-week__popup">
                <view class="switch-week__title">切换周数</view>
                <view class="switch-week__list">
                    <view class="switch-week__item" v-for="(item, index) in totalWeek" :key="index">
                        <view @click="switchWeek(item + 1)" :class="{ 'active': nowWeek == index + 1 }"
                            class="switch-week__item-box">{{ item + 1 }}</view>
                    </view>
                </view>
            </view>
        </van-popup> -->
    </view>
</template>

<script>
export default {
    data() {
        return {
            nowWeek: 1,
            totalWeek: 20,
            showSwitchWeek: false,
            weekDayCount: 7,
            startDate: '2023/02/20',
            weekIndexText: ['一', '二', '三', '四', '五', '六', '日'],
            nowMonth: 1,
            courseList: [],
            colorList: ["#116A7B", "#DD58D6", "#30A2FF", "#0079FF", "#F79327", "#47A992", "#7A3E3E", "#FF55BB", "#A0D8B3", "#539165", "#3A98B9", "#609966"],
            courseColor: {},
            weekCalendar: [1, 2, 3, 4, 5, 6, 7],
            firstEntry: true,
            windowWidth: 0,
            todayMonth: 0,
            todayDay: 0,
            isSwiping: false,
            xqjmcMap: {
                "1": "星期一",
                "2": "星期二",
                "3": "星期三",
                "4": "星期四",
                "5": "星期五",
                "6": "星期六",
                "7": "星期日"
            },
        }
    },
    methods: {
        onLoad() {
            const { windowWidth } = uni.getSystemInfoSync()
            this.windowWidth = windowWidth
            this.getWeekDates()
            this.getNowWeek()
            this.getData()
            this.getTodayDate()
        },
        selectWeek() {
            this.showSwitchWeek = true
        },
        switchWeek(week) {
            this.showSwitchWeek = false
            this.switchWeekFn(week)
        },
        switchWeekFn(week) {
            this.nowWeek = week
            this.getWeekDates()
        },
        hideSwitchWeek() {
            this.showSwitchWeek = false
        },
        getWeekDates() {
            const startDate = new Date(this.startDate)
            const addTime = (this.nowWeek - 1) * 7 * 24 * 60 * 60 * 1000
            const firstDate = startDate.getTime() + addTime
            const { month: nowMonth } = this.getDateObject(new Date(firstDate))
            const weekCalendar = []
            for (let i = 0; i < this.weekDayCount; i++) {
                const date = new Date(firstDate + i * 24 * 60 * 60 * 1000)
                const { day } = this.getDateObject(date)
                weekCalendar.push(day)
            }
            this.nowMonth = nowMonth
            this.weekCalendar = weekCalendar
        },
        getDateObject(date = new Date()) {
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const day = date.getDate()
            return { year, month, day }
        },
        getNowWeek() {
            const nowWeek = this.calculateNowWeek(this.startDate, this.totalWeek)
            this.nowWeek = nowWeek
            this.getWeekDates()
        },
        calculateNowWeek(startDate, totalWeek) {
            const nowDate = new Date().getTime()
            startDate = new Date(startDate)
            const time = nowDate - startDate
            let nowWeek = Math.ceil(time / 1000 / 60 / 60 / 24 / 7)
            if (nowWeek > totalWeek) {
                nowWeek = 1
            }
            return nowWeek
        },
        indexOf(zcd, week) {
            const weeks = [];
            const weekRanges = zcd.split(','); // 以逗号分隔
            weekRanges.forEach(range => {
                range = range.trim();
                const match = range.match(/(\d+)-(\d+)(\((单|双)\))?/); // 匹配范围和单双周
                if (match) {
                    const start = parseInt(match[1]);
                    const end = parseInt(match[2]);
                    for (let i = start; i <= end; i++) {
                        weeks.push(i); // 添加范围内的周
                    }
                    if (match[3]) {
                        // 如果有单双周，添加相应的周
                        if (match[4] === '双') {
                            weeks.push(...Array.from({ length: end - start + 1 }, (_, i) => start + i * 2));
                        } else if (match[4] === '单') {
                            weeks.push(...Array.from({ length: end - start + 1 }, (_, i) => start + i * 2 + 1));
                        }
                    }
                } else {
                    // 处理单个周
                    weeks.push(parseInt(range));
                }
            });
            return weeks.includes(week); // 检查是否包含当前周
        },
        getData() {
            const cache = uni.getStorageSync('courses')
            const courseColorCache = uni.getStorageSync('courseColor')
            if (cache) {
                this.courseList = cache
                if (!courseColorCache) {
                    this.buildCourseColor()
                } else {
                    this.courseColor = courseColorCache
                }
                return
            }
            this.updateFn(true)
        },
        update() {
            this.updateFn()
        },
        updateFn(firstEntry = false) {
            // 模拟假数据
            const mockData = [
                {
                    kch_id: "1",
                    kcmc: "Web 开发技术",
                    cdmc: "明德楼A1101",
                    jc: "1-2节",
                    xqjmc: "星期一",
                    xqj: "1",
                    zxs: "24",
                    zcd: "1-6周(单)", // 有效的 zcd 字段
                    section: 1,
                    sectionCount: 2,
                    weeks: "1,2,3,4,5,6" // 课程周数
                },
                {
                    kch_id: "2",
                    kcmc: "数据结构",
                    cdmc: "明德楼A1102",
                    jc: "3-4节",
                    xqjmc: "星期一",
                    xqj: "2",
                    zxs: "24",
                    zcd: "1-6周(双)", // 有效的 zcd 字段
                    section: 3,
                    sectionCount: 2,
                    weeks: "1,2,3,4,5,6" // 课程周数
                }
            ];

            // 直接返回假数据
            this.courseList = mockData;
            this.buildCourseColor();
            if (!firstEntry) {
                uni.showToast({ title: '更新成功', icon: 'success' });
            }
            uni.setStorageSync('courses', mockData);
        },
        onTouchStart() {
            this.isSwiping = true;
        },
        onTouchEnd() {
            this.isSwiping = false;
        },
        swiperSwitchWeek(e) {
            const index = e.detail.current;
            this.nowWeek = index + 1;
            this.getWeekDates();
        },
        buildCourseColor() {
            const courseColor = {}
            let colorIndex = 0
            this.courseList.forEach(item => {
                if (courseColor[item.kcmc] === undefined) {
                    courseColor[item.kcmc] = this.colorList[colorIndex]
                    colorIndex++
                }
            })
            uni.setStorageSync('courseColor', courseColor)
            this.courseColor = courseColor
        },
        getTodayDate() {
            const { month: todayMonth, day: todayDay } = this.getDateObject()
            this.todayMonth = todayMonth
            this.todayDay = todayDay
        },
        navCourseDetail(e) {
            const index = e.currentTarget.dataset.index
            uni.navigateTo({
                url: `/pages/course-detail/index?info=${JSON.stringify(this.courseList[index])}`,
            })
        }
    },
    mounted() {
        this.onLoad()
    }
}
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: auto;
}

.week-list {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rpx;
    background-color: #f5f7f8;
}

.now-month {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #666;
}

.week-item {
    flex: 1;
    text-align: center;
}

.week-name {
    font-size: 24rpx;
    color: #444;
}

.week-date {
    font-size: 20rpx;
    color: #a1a1a1;
}

.course-content {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.course-nums {
    width: 50rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f6f7;
}

.course-num {
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: #999;
}

.course-swpier {
    flex: 1;
    height: 1200rpx;
}

.course-item {
    position: absolute;
    width: calc((100% - 50rpx) / 7);
    padding: 2rpx;
}

.course-item__content {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #ffffff;
    text-align: center;
}

.switch-week__popup {
    padding: 30rpx;
}

.switch-week__title {
    text-align: center;
    font-size: 34rpx;
    font-weight: 500;
}

.switch-week__list {
    display: flex;
    flex-wrap: wrap;
    margin-top: 30rpx;
}

.switch-week__item {
    width: 20%;
    padding: 10rpx;
}

.switch-week__item-box {
    width: 100%;
    height: 100rpx;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
}

.switch-week__item-box.active {
    background-color: var(--theme);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
}
</style>