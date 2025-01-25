<template>
    <view class="container">
        <view @tap="selectWeek"><text>第{{ nowWeek }}周</text> <text class="cuIcon-unfold"></text></view>
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
            <swiper :duration="300" class="course-swpier" :current="nowWeek - 1" @change="swiperSwitchWeek"
                @touchstart="onTouchStart" @touchend="onTouchEnd">
                <swiper-item v-for="(item, weekIndex) in totalWeek" :key="weekIndex">
                    <view class="course-list">
                        <view class="course-item" v-for="(course, index) in courseList" :key="course.id"
                            :style="getCourseStyle(course)">
                            <view class="course-item__content"
                                :style="{ backgroundColor: courseColor[course.kcmc], zIndex: 1 }"
                                @tap="showCourseDetail(course)" v-if="indexOf(course.zcd, weekIndex + 1)">
                                {{ course.kcmc }}&nbsp;{{ course.xslxbj }}<br />@{{ course.cdmc }}
                            </view>
                        </view>
                    </view>
                </swiper-item>
            </swiper>
        </view>
    </view>
</template>

<script>
import { http } from '@/utils/http'

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
            colorList: [
                "#116A7B",
                "#DD58D6",
                "#30A2FF",
                "#0079FF",
                "#F79327",
                "#47A992",
                "#7A3E3E",
                "#FF55BB",
                "#A0D8B3",
                "#539165",
                "#3A98B9",
                "#609966"
            ],
            courseColor: {},
            weekCalendar: [1, 2, 3, 4, 5, 6, 7],
            firstEntry: true,
            windowWidth: 0,
            todayMonth: 0,
            todayDay: 0,
            isSwiping: false,
            currentIndex: undefined,
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
                const match = range.match(/(\d+)-(\d+)周\((单|双)\)/);
                if (match) {
                    const start = parseInt(match[1]);
                    const end = parseInt(match[2]);
                    if (match[3]) {
                        // 如果有单双周，添加相应的周
                        if (match[3] === '双') {
                            for (let i = start; i <= end; i++) {
                                if (i % 2 === 0) weeks.push(i); // 只添加双周
                            }
                        } else if (match[3] === '单') {
                            for (let i = start; i <= end; i++) {
                                if (i % 2 !== 0) weeks.push(i); // 只添加单周
                            }
                        }
                    }
                } else {
                    const m2 = range.match(/(\d+)-(\d+)周/);
                    if (m2) {
                        // 没有单双周标识，添加范围内的周
                        for (let j = parseInt(m2[1]); j <= parseInt(m2[2]); j++) {
                            weeks.push(j); // 添加范围内的周
                        }
                    }
                    else {
                        // 处理单个周
                        weeks.push(parseInt(range));
                    }
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
            this.updateFn()
        },
        update() {
            this.updateFn()
        },
        async updateFn() {
            const res = await http({
                method: 'POST',
                url: '/kb/option',
                data: { 'xnm': '2024', 'xqm': '12' }
            }, true)

            // const mockData = [
            //     {
            //         "kcmc": "(网络课)学问海鲜",
            //         "xslxbj": "*",
            //         "cdmc": "广学楼330(多)",
            //         "jc": "1-2节",
            //         "xqj": "6",
            //         "zcd": "2-4周(双),7周,10-12周(双)"
            //     },
            // ]
            // const res = {}
            // res.data = mockData

            // 为每个课程添加唯一id
            this.courseList = res.data.map((course, index) => ({
                ...course,
                id: index
            }));

            this.buildCourseColor();
            uni.setStorageSync('courses', this.courseList);
        },
        onTouchStart() {
            this.isSwiping = true;
        },
        onTouchEnd() {
            this.isSwiping = false;
        },
        swiperSwitchWeek(e) {
            this.nowWeek = e.detail.current + 1;
            this.getWeekDates();
        },
        buildCourseColor() {
            const courseColor = {};
            let colorIndex = 0;
            const colorListLength = this.colorList.length;

            this.courseList.forEach(item => {
                if (courseColor[item.kcmc] === undefined) {
                    // 当colorIndex达到颜色数组长度时，重置为0
                    if (colorIndex >= colorListLength) {
                        colorIndex = 0;
                    }
                    courseColor[item.kcmc] = this.colorList[colorIndex];
                    colorIndex++;
                }
            });

            uni.setStorageSync('courseColor', courseColor);
            this.courseColor = courseColor;
        },
        getTodayDate() {
            const { month: todayMonth, day: todayDay } = this.getDateObject()
            this.todayMonth = todayMonth
            this.todayDay = todayDay
        },
        getCourseStyle(course) {
            // 解析节次信息，例如 "1-2节"
            const [startSection, endSection] = course.jc
                .replace('节', '')
                .split('-')
                .map(num => parseInt(num));

            // 计算课程持续节数
            const sectionCount = endSection - startSection + 1;

            // 计算位置
            const left = `${(parseInt(course.xqj) - 1) * (100 / 7)}%`;  // 星期几
            const top = `${(startSection - 1) * 120}rpx`;             // 开始节次
            const height = `${sectionCount * 120}rpx`;                // 课程节数
            const width = `${100 / 7}%`;                                // 每天的宽度

            return {
                left,
                top,
                height,
                width,
                position: 'absolute',
                boxSizing: 'border-box',
                padding: '2rpx'
            }
        },
        showCourseDetail(course) {
            console.log(course)
        }
    },
    onShow() {

    },
    onPullDownRefresh() {
        this.update()
    },
    mounted() {
        this.onLoad()
    },
    computed: {
        preloadedWeeks() {
            const weeks = {};
            // 预加载当前周及其前后一周的数据
            [-1, 0, 1].forEach(offset => {
                const weekNum = this.nowWeek + offset;
                if (weekNum > 0 && weekNum <= this.totalWeek) {
                    weeks[weekNum] = this.courseList.filter(course =>
                        this.indexOf(course.zcd, weekNum)
                    );
                }
            });
            return weeks;
        }
    }
}
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
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

.course-list {
    position: relative;
    width: 100%;
    height: 1200rpx;
}

.course-item {
    position: absolute;
    box-sizing: border-box;
    padding: 2rpx;
    pointer-events: none;
}

.course-item__content {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #ffffff;
    padding: 4rpx;
    word-break: break-all;
    pointer-events: auto;
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