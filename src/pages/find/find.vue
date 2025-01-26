<template>
    <page-meta :page-style="'overflow:' + (!isSwiping ? 'visible' : 'hidden')"></page-meta>
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
                        <!-- 1. 先渲染本周的课程 -->
                        <view class="course-item" v-for="course in courseList" :key="'current-' + course.id"
                            :style="getCourseStyle(course)">
                            <view class="course-item__content"
                                v-if="indexOf(course.zcd, weekIndex + 1)"
                                :style="{ 
                                    backgroundColor: courseColor[course.kcmc],
                                    zIndex: 3,
                                    opacity: 1
                                }"
                                @tap="showCourseDetail(course)">
                                {{ course.kcmc }}&nbsp;{{ course.xslxbj }}<br />
                                <view class="location">@{{ course.cdmc }}</view>
                                <view class="conflict-indicator" 
                                    v-if="findOverlappingCourses(course, weekIndex + 1).length > 1">
                                </view>
                            </view>
                        </view>

                        <!-- 2. 再渲染下一周的课程 -->
                        <view class="course-item" v-for="course in courseList" :key="'next-' + course.id"
                            :style="getCourseStyle(course)">
                            <view class="course-item__content"
                                v-if="indexOf(course.zcd, weekIndex + 2)"
                                :style="{ 
                                    backgroundColor: '#dcdcdc',
                                    zIndex: 2,
                                    opacity: 0.8,
                                    color: '#989898'
                                }"
                                @tap="showCourseDetail(course)">
                                <view class="course-tag">[下周]</view><br />
                                {{ course.kcmc }}&nbsp;{{ course.xslxbj }}<br />
                                <view class="location">@{{ course.cdmc }}</view>
                                <view class="conflict-indicator" 
                                    v-if="findOverlappingCourses(course, weekIndex + 1).length > 1">
                                </view>
                            </view>
                        </view>

                        <!-- 3. 最后渲染其他非本周的课程 -->
                        <view class="course-item" v-for="course in courseList" :key="'future-' + course.id"
                            :style="getCourseStyle(course)">
                            <view class="course-item__content"
                                v-if="!indexOf(course.zcd, weekIndex + 1) && !indexOf(course.zcd, weekIndex + 2) && hasLaterWeek(course.zcd, weekIndex + 1)"
                                :style="{ 
                                    backgroundColor: '#dcdcdc',
                                    zIndex: 1,
                                    opacity: 0.8
                                }"
                                @tap="showCourseDetail(course)">
                                <view class="course-tag">[非本周]</view><br />
                                {{ course.kcmc }}&nbsp;{{ course.xslxbj }}<br />
                                <view class="location">@{{ course.cdmc }}</view>
                                <view class="conflict-indicator" 
                                    v-if="findOverlappingCourses(course, weekIndex + 1).length > 1">
                                </view>
                            </view>
                        </view>
                    </view>
                </swiper-item>
            </swiper>
        </view>
    </view>

    <view @tap="closeDetailPop">
        <uni-popup ref="detailPop" background-color="transparent" @change="detailPopChange" type="center">
            <view class="popup-list">
                <view class="popup-content" v-for="(course, index) in courseDetail" :key="index" :style="{
                    backgroundColor: isCurrentWeekCourse(course.zcd, nowWeek) ? 
                        (index === 0 ? courseColor[course.kcmc] : '#dcdcdc') : '#dcdcdc'
                }">

                    <view class="week-tag" v-if="!isCurrentWeekCourse(course.zcd, nowWeek)">
                        {{ indexOf(course.zcd, nowWeek + 1) ? '[下周]' : '[非本周]' }}
                    </view>

                    <view class="course-name">{{ course.kcmc }} {{ course.xslxbj }}</view>
                    <view class="course-info">
                        <uni-icons color="#fff" type="location" size="15" />{{ course.cdmc }}
                    </view>
                    <view class="course-info">
                        <uni-icons color="#fff" type="calendar-filled" size="15" />
                        星期{{ weekIndexText[parseInt(course.xqj) - 1] }} {{ course.jc }}
                    </view>
                    <view class="course-info">
                        <uni-icons color="#fff" type="calendar" size="15" />{{ course.zcd }}
                    </view>
                    <view class="course-info">
                        <uni-icons color="#fff" type="staff" size="15" />{{ course.xm }}
                    </view>
                    
                </view>
            </view>
        </uni-popup>
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
                "#FF9E9E", "#88C4FF", "#FFB562", "#98D8AA", "#B784B7",
                "#87A2FB", "#96C291", "#FFA1CF", "#89B9AD", "#93BFCF",
                "#BEA6FF", "#6699FF", "#FFB7B7", "#FFD0A5"
            ],
            courseColor: {},
            weekCalendar: [1, 2, 3, 4, 5, 6, 7],
            firstEntry: true,
            windowWidth: 0,
            todayMonth: 0,
            todayDay: 0,
            isSwiping: false,
            courseDetail: [],
            currentSlidingWeek: 1,
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
            const weekRanges = zcd.split(',');
            weekRanges.forEach(range => {
                range = range.trim();
                const match = range.match(/(\d+)-(\d+)周\((单|双)\)/);
                if (match) {
                    const start = parseInt(match[1]);
                    const end = parseInt(match[2]);
                    if (match[3]) {
                        if (match[3] === '双') {
                            for (let i = start; i <= end; i++) {
                                if (i % 2 === 0) weeks.push(i);
                            }
                        } else if (match[3] === '单') {
                            for (let i = start; i <= end; i++) {
                                if (i % 2 !== 0) weeks.push(i);
                            }
                        }
                    }
                } else {
                    const m2 = range.match(/(\d+)-(\d+)周/);
                    if (m2) {
                        for (let j = parseInt(m2[1]); j <= parseInt(m2[2]); j++) {
                            weeks.push(j);
                        }
                    } else {
                        weeks.push(parseInt(range));
                    }
                }
            });
            return weeks.includes(week);
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

            this.courseList = res.data.map((course, index) => ({
                ...course,
                id: index
            }));

            this.buildCourseColor();
            uni.setStorageSync('courses', this.courseList);
        },
        onTouchStart(e) {
            this.currentSlidingWeek = this.nowWeek;
        },
        onTouchEnd() {
        },
        swiperSwitchWeek(e) {
            this.currentSlidingWeek = e.detail.current + 1;
            this.nowWeek = e.detail.current + 1;
            this.getWeekDates();
        },
        buildCourseColor() {
            const courseColor = {};
            let colorIndex = 0;
            const colorListLength = this.colorList.length;

            this.courseList.forEach(item => {
                if (courseColor[item.kcmc] === undefined) {
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
            let startSection, endSection;

            if (course.jc.includes('-')) {
                [startSection, endSection] = course.jc
                    .replace('节', '')
                    .split('-')
                    .map(num => parseInt(num));
            } else {
                startSection = endSection = parseInt(course.jc.replace('节', ''));
            }

            const sectionCount = endSection - startSection + 1;
            const left = `${(parseInt(course.xqj) - 1) * (100 / 7)}%`;
            const top = `${(startSection - 1) * 120}rpx`;
            const height = `${sectionCount * 120}rpx`;
            const width = `${100 / 7}%`;

            return {
                left,
                top,
                height,
                width,
                position: 'absolute',
                boxSizing: 'border-box',
                padding: '4rpx'
            }
        },
        showCourseDetail(course) {
            uni.vibrateShort({type: 'heavy'})
            this.courseDetail = this.findOverlappingCourses(course, this.nowWeek);
            this.$refs.detailPop.open();
        },
        findOverlappingCourses(course, weekIndex) {
            let [currentStart, currentEnd] = course.jc
                .replace('节', '')
                .split('-')
                .map(num => parseInt(num));

            if (isNaN(currentEnd)) {
                currentEnd = currentStart;
            }

            const overlappingCourses = this.courseList.filter(otherCourse => {
                // 必须是同一天的课程
                if (otherCourse.xqj !== course.xqj) {
                    return false;
                }

                // 检查时间是否重叠
                let [otherStart, otherEnd] = otherCourse.jc
                    .replace('节', '')
                    .split('-')
                    .map(num => parseInt(num));

                if (isNaN(otherEnd)) {
                    otherEnd = otherStart;
                }

                // 时间必须有重叠
                const timeOverlap = !(otherEnd < currentStart || otherStart > currentEnd);
                
                // 检查是否是当前周的课程或者后续周的课程
                const isCurrentWeek = this.indexOf(otherCourse.zcd, weekIndex);
                const hasLater = this.hasLaterWeek(otherCourse.zcd, weekIndex);

                return timeOverlap && (isCurrentWeek || hasLater);
            });

            // 将当前课程放在第一位
            const currentIndex = overlappingCourses.findIndex(c => c.id === course.id);
            if (currentIndex > 0) {
                overlappingCourses.unshift(...overlappingCourses.splice(currentIndex, 1));
            }

            return overlappingCourses;
        },
        // 获取当前周之后的周数
        getWeeksAfterCurrent(zcd) {
            const weeks = [];
            const weekRanges = zcd.split(',');
            const currentWeek = this.nowWeek;
            
            weekRanges.forEach(range => {
                range = range.trim();
                const match = range.match(/(\d+)-(\d+)周\((单|双)\)/);
                if (match) {
                    const start = parseInt(match[1]);
                    const end = parseInt(match[2]);
                    if (match[3]) {
                        if (match[3] === '双') {
                            for (let i = start; i <= end; i++) {
                                if (i % 2 === 0 && i >= currentWeek) weeks.push(i);
                            }
                        } else if (match[3] === '单') {
                            for (let i = start; i <= end; i++) {
                                if (i % 2 !== 0 && i >= currentWeek) weeks.push(i);
                            }
                        }
                    }
                } else {
                    const m2 = range.match(/(\d+)-(\d+)周/);
                    if (m2) {
                        for (let j = parseInt(m2[1]); j <= parseInt(m2[2]); j++) {
                            if (j >= currentWeek) weeks.push(j);
                        }
                    } else {
                        const week = parseInt(range);
                        if (week >= currentWeek) weeks.push(week);
                    }
                }
            });
            
            return weeks;
        },
        detailPopChange(e) {
            this.isSwiping = e.show
        },
        closeDetailPop() {
            this.$refs.detailPop.close()
        },
        isCurrentWeekCourse(zcd, currentWeek) {
            return this.indexOf(zcd, currentWeek);
        },
        isFutureCourse(zcd, currentWeek) {
            const weeks = [];
            const weekRanges = zcd.split(',');
            
            weekRanges.forEach(range => {
                range = range.trim();
                const match = range.match(/(\d+)-(\d+)周\((单|双)\)/);
                if (match) {
                    const start = parseInt(match[1]);
                    const end = parseInt(match[2]);
                    if (match[3]) {
                        if (match[3] === '双') {
                            for (let i = start; i <= end; i++) {
                                if (i % 2 === 0) weeks.push(i);
                            }
                        } else if (match[3] === '单') {
                            for (let i = start; i <= end; i++) {
                                if (i % 2 !== 0) weeks.push(i);
                            }
                        }
                    }
                } else {
                    const m2 = range.match(/(\d+)-(\d+)周/);
                    if (m2) {
                        for (let j = parseInt(m2[1]); j <= parseInt(m2[2]); j++) {
                            weeks.push(j);
                        }
                    } else {
                        weeks.push(parseInt(range));
                    }
                }
            });
            
            return weeks.some(week => week > currentWeek);
        },
        hasLaterWeek(zcd, currentWeek) {
            const weeks = [];
            const weekRanges = zcd.split(',');
            
            weekRanges.forEach(range => {
                range = range.trim();
                const match = range.match(/(\d+)-(\d+)周\((单|双)\)/);
                if (match) {
                    const start = parseInt(match[1]);
                    const end = parseInt(match[2]);
                    if (match[3]) {
                        if (match[3] === '双') {
                            for (let i = start; i <= end; i++) {
                                if (i % 2 === 0) weeks.push(i);
                            }
                        } else if (match[3] === '单') {
                            for (let i = start; i <= end; i++) {
                                if (i % 2 !== 0) weeks.push(i);
                            }
                        }
                    }
                } else {
                    const m2 = range.match(/(\d+)-(\d+)周/);
                    if (m2) {
                        for (let j = parseInt(m2[1]); j <= parseInt(m2[2]); j++) {
                            weeks.push(j);
                        }
                    } else {
                        weeks.push(parseInt(range));
                    }
                }
            });
            
            return weeks.some(week => week > currentWeek);
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
        filteredCourseList() {
            return this.courseList;
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
    padding: 4rpx;
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
    position: relative;
    pointer-events: auto;
    overflow: hidden;
}

.popup-content {
    width: 325rpx;
    height: 325rpx;
    border-radius: 12rpx;
    color: #ffffff;
    padding: 20rpx;
    box-sizing: border-box;
    position: relative;
}

.week-tag {
    font-size: 24rpx;
    margin-bottom: 8rpx;
}

.course-name {
    font-size: 26rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
}

.course-info {
    font-size: 24rpx;
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    gap: 4rpx;
}

.course-tag {
    font-size: 20rpx;
    margin-bottom: 2rpx;
}

.location {
    font-size: 20rpx;
    margin-top: 2rpx;
}

:deep(.uni-popup .uni-popup__wrapper) {
    border-radius: 12rpx !important;
    overflow: hidden;
    background-color: transparent !important;
}

.popup-list {
    display: flex;
    flex-wrap: wrap;
    gap: 35rpx;
    padding: 20rpx;
    justify-content: center;
}

.conflict-indicator {
    position: absolute;
    right: -10rpx;
    bottom: -10rpx;
    width: 30rpx;
    height: 30rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
}
</style>