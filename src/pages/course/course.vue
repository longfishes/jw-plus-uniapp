<template>
    <page-meta :page-style="'overflow:' + (!isSwiping ? 'visible' : 'hidden')"></page-meta>

    <!-- <view class="mask" v-if="isSwiping" @click="closeMask"></view> -->

    <view class="navbar" @touchmove.prevent
        :style="{ paddingTop: safeAreaTop + 'px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: '#fff' }">
        <view class="header">
            <uni-icons type="settings" size="30" @tap="toggleSetting"></uni-icons>
            <view class="spacer"></view>
            <view class="center-content" @tap="toggleSelectWeek">
                <view class="nav-action" style="visibility: hidden;">
                    回到本周&nbsp;
                </view>
                <view class="week-info">
                    <text>第{{ nowWeek }}周</text>
                </view>
                <uni-icons type="down" size="18" color="#2979ff"
                    :style="{ 
                        transform: showSwitchWeek ? 
                        'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.3s ease' 
                            }">
                </uni-icons>
                <view class="nav-action" @tap.stop="backToCurrentWeek" :style="{
        visibility: getNowWeek() > 0
            && getNowWeek() != nowWeek ? 'visible' : 'hidden',
    }">
                    &nbsp;回到本周
                </view>
            </view>
            <view class="spacer"></view>
            <uni-icons type="settings" size="30" style="visibility: hidden;"></uni-icons>
        </view>
    </view>

    <view>
        <uni-popup ref="swichWeekPop" type="bottom" :safeArea="false" @change="swichWeekPopChange">
            <view class="progress-container">
                <view class="progress-header">
                    <text class="header-title">周数</text>
                    <text class="header-action" v-if="getNowWeek() == -1">
                        学期未开始
                    </text>
                    <text class="header-action" v-else-if="getNowWeek() == -2">
                        学期已结束
                    </text>
                    <text class="header-action" v-else-if="this.nowWeek != getNowWeek()" @tap="backToCurrentWeek">
                        回到本周
                    </text>
                </view>
                <Progress v-model:value="nowWeek" :max="totalWeek" />
            </view>
        </uni-popup>
    </view>

    <view>
        <uni-popup ref="settingPop" type="bottom" :safeArea="false" @change="settingPopChange">
            <view class="setting-popup-content">
                <uni-list :border="false">
                    <uni-list-item title="刷新课表" clickable @click="refreshCourse" />
                    <uni-list-item title="切换学期" clickable showArrow @click="navigateToStage" />
                    <uni-list-item title="课表外观" clickable showArrow @click="navigateToAppearance" />
                    <uni-list-item title="测试" clickable showArrow />
                </uni-list>
            </view>
        </uni-popup>
    </view>

    <scroll-view 
        scroll-y
        :refresher-enabled="true" 
        :bounces="true"
        @refresherrefresh="onRefresh"
        :refresher-triggered="isTriggered" 
        :style="{ paddingTop: paddingTopStyle, height: '100vh' }"
    >
        <view class="container">
            <view class="week-list">
                <view style="width: 50rpx;"></view>
                <view class="week-item" v-for="(item, index) in weekDayCount" :key="index">
                    <view class="week-item-inner"
                        :class="{ 'active': isToday(index) }">
                        <text class="week-name">{{ weekIndexText[index] }}</text>
                        <text class="week-date">
                            {{
        // 计算当前日期
        (() => {
            const startDate = new Date(this.startDate);
            const addTime = (this.nowWeek - 1) * 7 * 24 * 60 * 60 * 1000;
            const currentDate = new Date(startDate.getTime() + addTime + index * 24 * 60 * 60 * 1000);
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate();
            return `${month}/${day}`;
        })()
    }}
                        </text>
                    </view>
                </view>
            </view>
            <view class="course-content">
                <swiper :duration="300" class="course-swpier" @touchstart="onTouchStart" @touchend="onTouchEnd"
                    :current="nowWeek - 1" @change="swiperSwitchWeek" @animationfinish="onAnimationfinish">
                    <swiper-item v-for="(item, weekIndex) in totalWeek" :key="weekIndex">
                        <view class="course-container">
                            <view class="course-nums">
                                <view class="course-num" v-for="(num, index) in 10" :key="index">
                                    <text class="start-time" 
                                        :style="{ visibility: showStartTime ? 'visible' : 'hidden' }"
                                    >{{ startTimes[index] }}</text>
                                    <text class="section-num">{{ index + 1 > 9 ? index + 1 : '0' + (index + 1) }}</text>
                                    <text class="end-time" 
                                        :style="{ visibility: showEndTime ? 'visible' : 'hidden' }"
                                    >{{ endTimes[index] }}</text>
                                </view>
                            </view>

                            <view class="course-list">
                                <view class="course-grid" v-show="showGridLines">
                                    <view class="grid-line" v-for="i in 9" :key="i" 
                                          :style="{ top: (i - 1) * 120 + 'rpx' }">
                                    </view>
                                </view>

                                <template v-for="(course, index) in courseList" :key="index">
                                    <view class="course-item" :style="getCourseStyle(course)">
                                        <template v-if="shouldShowCourse(course, weekIndex + 1)">
                                            <!-- 当前周课程 -->
                                            <view v-if="indexOf(course.zcd, weekIndex + 1)" class="course-item__content"
                                                :style="{
        backgroundColor: courseColor[course.kcmc],
        zIndex: 3,
        opacity: 1
    }" @tap="showCourseDetail(course)">
                                                {{ course.kcmc }}&nbsp;{{ course.xslxbj }}<br />
                                                <view class="location">@{{ course.cdmc }}</view>
                                                <view class="conflict-indicator"
                                                    v-if="findOverlappingCourses(course, weekIndex + 1).length > 1">
                                                </view>
                                            </view>

                                            <!-- 下周课程 -->
                                            <view v-else-if="showOtherWeek && indexOf(course.zcd, weekIndex + 2)"
                                                class="course-item__content" :style="{
        backgroundColor: '#dcdcdc',
        zIndex: 2,
        opacity: 1,
        color: '#989898'
    }" @tap="showCourseDetail(course)">
                                                <view class="course-tag">[下周]</view><br />
                                                {{ course.kcmc }}&nbsp;{{ course.xslxbj }}<br />
                                                <view class="location">@{{ course.cdmc }}</view>
                                                <view class="conflict-indicator"
                                                    v-if="findOverlappingCourses(course, weekIndex + 1).length > 1">
                                                </view>
                                            </view>

                                            <!-- 非本周课程 -->
                                            <view v-else-if="showOtherWeek && hasLaterWeek(course.zcd, weekIndex + 1)"
                                                class="course-item__content" :style="{
        backgroundColor: '#dcdcdc',
        zIndex: 1,
        opacity: 1
    }" @tap="showCourseDetail(course)">
                                                <view class="course-tag">[非本周]</view><br />
                                                {{ course.kcmc }}&nbsp;{{ course.xslxbj }}<br />
                                                <view class="location">@{{ course.cdmc }}</view>
                                                <view class="conflict-indicator"
                                                    v-if="findOverlappingCourses(course, weekIndex + 1).length > 1">
                                                </view>
                                            </view>
                                        </template>
                                    </view>
                                </template>
                            </view>
                        </view>
                    </swiper-item>
                </swiper>
            </view>
        </view>
    </scroll-view>

    <view @tap="closeDetailPop">
        <uni-popup 
            ref="detailPop" 
            background-color="transparent" 
            @change="detailPopChange" 
            type="center"
        >
            <view class="popup-list">
                <view class="popup-content" v-for="(course, index) in courseDetail" :key="index" :style="{
                    backgroundColor: isCurrentWeekCourse(course.zcd, nowWeek) ?
                        courseColor[course.kcmc] : '#dcdcdc'
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
import Progress from '@/components/Progress.vue'
import { useSettingStore } from '@/stores/modules/setting'
import { defaultStartTimes, defaultEndTimes, defaultColors } from '@/config/defaults'

const settingStore = useSettingStore()

export default {
    components: {
        Progress
    },
    data() {
        return {
            startDate: '2024/01/01',
            totalWeek: 20,
            xnm: '2024',
            xqm: '12',
            nowWeek: 1,
            showSwitchWeek: false,
            weekDayCount: 7,
            weekIndexText: ['一', '二', '三', '四', '五', '六', '日'],
            nowMonth: new Date().getMonth() + 1,
            courseList: [],
            colorList: defaultColors,
            courseColor: {},
            weekCalendar: [1, 2, 3, 4, 5, 6, 7],
            todayMonth: 0,
            todayDay: 0,
            isSwiping: false,
            courseDetail: [],
            startTimes: defaultStartTimes,
            endTimes: defaultEndTimes,
            safeAreaTop: 0,
            isTriggered: false,
            showGridLines: true,
            showOtherWeek: true,
            showStartTime: true,
            showEndTime: true,
        }
    },
    methods: {
        toggleSelectWeek() {
            uni.vibrateShort({ type: 'heavy' })
            this.$refs.swichWeekPop.open()
        },
        toggleSetting() {
            uni.vibrateShort({ type: 'heavy' })
            this.$refs.settingPop.open()
        },
        settingPopChange(e) {
            this.isSwiping = e.show
        },
        swichWeekPopChange(e) {
            this.isSwiping = e.show
            this.showSwitchWeek = e.show
        },
        getDateObject(date = new Date()) {
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const day = date.getDate()
            return { year, month, day }
        },
        getNowWeek() {
            const nowDate = new Date().getTime(); // 当前时间戳
            const startDate = new Date(this.startDate).getTime(); // 学期开始时间戳
            const timeDiff = nowDate - startDate; // 时间差
            let nowWeek = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7)); // 计算周数
            if (nowWeek < 1) {
                nowWeek = -1; // 当前日期在学期开始之前
            } else if (nowWeek > this.totalWeek) {
                nowWeek = -2; // 超过总周数, 学期已结束
            }
            return nowWeek
        },
        slideNowWeek() {
            let nowWeek = this.getNowWeek()
            if (nowWeek < 0) {
                this.nowWeek = 1
            } else {
                this.nowWeek = nowWeek
            }
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
            const cache = uni.getStorageSync('courses_' + this.xnm + '_' + this.xqm)
            if (cache) {
                this.startDate = cache.startDate
                this.totalWeek = cache.totalWeek
                this.courseList = cache.list
                this.buildCourseColor()
                return
            }
            this.updateFn()
        },
        update() {
            this.updateFn()
        },
        async updateFn() {
            let res = null
            try {
                res = await http({
                    method: 'POST',
                    url: '/kb/option',
                    data: { 'xnm': this.xnm, 'xqm': this.xqm }
                }, true)
            } finally {
                uni.hideLoading()
                this.isTriggered = false
            }

            this.courseList = res.data.list.map((course, index) => ({
                ...course,
                id: index
            }));

            this.startDate = res.data.startTime
            this.totalWeek = res.data.weekNum

            this.buildCourseColor();
            uni.setStorageSync(
                'courses_' + this.xnm + '_' + this.xqm,
                { list: this.courseList, startDate: this.startDate, totalWeek: this.totalWeek }
            );
            this.getData()
            this.updateWeekDates()
        },
        swiperSwitchWeek(e) {
            if (e.target.source === 'touch') {
                this.nowWeek = e.detail.current + 1;
            }
        },
        onTouchStart() {

        },
        onTouchEnd() {

        },
        onAnimationfinish(e) {

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
            const height = `${sectionCount * 120 - 4}rpx`;
            const width = `${100 / 7}%`;

            return {
                left,
                top,
                height,
                width,
                position: 'absolute',
                boxSizing: 'border-box',
                padding: '2rpx 4rpx'
            }
        },
        showCourseDetail(course) {
            uni.vibrateShort({ type: 'heavy' })
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
        },
        initializeDate() {
            const today = new Date();
            this.todayMonth = today.getMonth() + 1; // 月份从0开始
            this.todayDay = today.getDate();
            this.nowMonth = this.todayMonth; // 初始化当前月份
        },
        updateWeekDates() {
            const startDate = new Date(this.startDate);
            const addTime = (this.nowWeek - 1) * 7 * 24 * 60 * 60 * 1000;
            const firstDate = startDate.getTime() + addTime;
            const weekCalendar = [];
            for (let i = 0; i < this.weekDayCount; i++) {
                const date = new Date(firstDate + i * 24 * 60 * 60 * 1000);
                const day = date.getDate();
                weekCalendar.push(day);
            }
            this.weekCalendar = weekCalendar;
            this.nowMonth = new Date(firstDate).getMonth() + 1; // 更新当前月份
        },
        onRefresh() {
            this.isTriggered = true
            this.update()
        },
        refreshCourse() {
            this.$refs.settingPop?.close()
            this.update()
        },
        closeMask() {
            this.$refs.detailPop?.close()
            this.$refs.settingPop?.close()
            this.$refs.swichWeekPop?.close()
        },
        backToCurrentWeek() {
            this.slideNowWeek()
        },
        swichStage(xnm, xqm) {
            this.xnm = xnm
            this.xqm = xqm
            uni.setStorageSync('course_stage', { xnm, xqm })
            this.getData()
            this.slideNowWeek()
        },
        initStage() {
            const stage = uni.getStorageSync('course_stage')
            if (stage) {
                this.xnm = stage.xnm
                this.xqm = stage.xqm
            } else {
                const nowStage = this.getNowStage()
                this.xnm = nowStage.xnm
                this.xqm = nowStage.xqm
                uni.setStorageSync('course_stage', nowStage)
            }
        },
        getNowStage() {
            let nowYear = new Date().getFullYear()
            let nowMonth = new Date().getMonth() + 1

            if (nowMonth < 8) nowYear--
            if (nowMonth < 2 || nowMonth >= 8) {
                return { xnm: nowYear.toString(), xqm: '3' }
            } else {
                return { xnm: nowYear.toString(), xqm: '12' }
            }
        },
        navigateToStage() {
            this.$refs.settingPop?.close()
            uni.navigateTo({ url: '/pages/stage/stage?xnm=' + this.xnm + '&xqm=' + this.xqm })
        },
        navigateToAppearance() {
            this.$refs.settingPop?.close()
            uni.navigateTo({ url: '/pages/appearance/appearance' })
        },
        shouldShowCourse(course, weekIndex) {
            const overlappingCourses = this.findOverlappingCourses(course, weekIndex);
            if (overlappingCourses.length <= 1) return true;

            // 获取当前时间段的所有课程
            const sortedCourses = [...overlappingCourses].sort((a, b) => {
                // 优先显示本周课程
                if (this.indexOf(a.zcd, weekIndex) && !this.indexOf(b.zcd, weekIndex)) return -1;
                if (!this.indexOf(a.zcd, weekIndex) && this.indexOf(b.zcd, weekIndex)) return 1;

                // 其次显示下周课程
                if (this.indexOf(a.zcd, weekIndex + 1) && !this.indexOf(b.zcd, weekIndex + 1)) return -1;
                if (!this.indexOf(a.zcd, weekIndex + 1) && this.indexOf(b.zcd, weekIndex + 1)) return 1;

                // 最后显示非本周课程
                return a.id - b.id;
            });

            // 只显示排序后的第一个课程
            return course.id === sortedCourses[0].id;
        },
        isToday(index) {
            const startDate = new Date(this.startDate);
            const addTime = (this.nowWeek - 1) * 7 * 24 * 60 * 60 * 1000;
            const currentDate = new Date(startDate.getTime() + addTime + index * 24 * 60 * 60 * 1000);
            
            const today = new Date();
            return currentDate.getFullYear() === today.getFullYear() &&
                   currentDate.getMonth() === today.getMonth() &&
                   currentDate.getDate() === today.getDate();
        },
        initializeSettings() {
            const settings = settingStore.settings
            this.showGridLines = settings.showGridLines
            this.showOtherWeek = settings.showOtherWeek
            this.showStartTime = settings.showStartTime
            this.showEndTime = settings.showEndTime
            if (settings?.colors.length > 0) {
                this.colorList = settings.colors
                this.buildCourseColor()
            }
        },
        swichAppearance() {
            this.initializeSettings()
        },
    },
    onShow() {
    },
    onLoad(options) {
        uni.$on('swichStage', this.swichStage)
        uni.$on('swichAppearance', this.swichAppearance)
        this.initializeSettings()
        this.initializeDate()
        this.initStage()
        this.getData()
        this.updateWeekDates()
    },
    onUnload() {
        uni.$off('swichStage', this.swichStage)
        uni.$off('swichAppearance', this.swichAppearance)
    },
    onPullDownRefresh() {
        this.update()
    },
    created() {
        const systemInfo = uni.getSystemInfoSync();
        this.safeAreaTop = systemInfo.safeAreaInsets?.top || 0;
    },
    mounted() {
        this.slideNowWeek();
    },
    computed: {
        filteredCourseList() {
            return this.courseList;
        },
        paddingTopStyle() {
            return uni.upx2px(70) + this.safeAreaTop + 'px';
        },
    },
    watch: {
        nowWeek: {
            handler(newVal) {
                this.updateWeekDates()
            }
        }
    }
}
</script>

<style scoped>
.progress-container {
    background-color: #ffffff;
    border-radius: 24rpx 24rpx 0 0;
    padding-bottom: 100rpx;
    box-sizing: border-box;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40rpx;
}

.header-title {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
}

.header-action {
    font-size: 28rpx;
    color: #2979ff;
}

.nav-action {
    font-size: 24rpx;
    color: #2979ff;
    white-space: nowrap;
}

.container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.header {
    height: 70rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;
    font-size: 32rpx;
    color: #333;
    /* border-bottom: 1rpx solid #2979ff; */
}

.spacer {
    flex: 1;
}

.center-content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 200rpx;
}

.week-info {
    font-size: 32rpx;
    letter-spacing: 5rpx;
    display: flex;
    align-items: center;
    white-space: nowrap;
    margin-right: 4rpx;
}

.week-list {
    display: flex;
    align-items: center;
}

.week-item {
    width: calc(100% / 7);
    text-align: center;
    padding: 8rpx;
    box-sizing: border-box;
}

.week-item-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
    border-radius: 8rpx;
    padding: 4rpx 0 6rpx;
}

.week-item-inner.active {
    background-color: #2979ff;
    color: #ffffff;
}

.week-name {
    font-size: 28rpx;
    color: #444;
}

.week-date {
    font-size: 20rpx;
    color: #a1a1a1;
}

.week-item-inner.active .week-name,
.week-item-inner.active .week-date {
    color: #ffffff;
}

.course-content {
    flex: 1;
    display: flex;
}

.course-container {
    display: flex;
    width: 100%;
    height: 100%;
}

.course-nums {
    width: 50rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.course-num {
    height: 120rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: #999;
    gap: 10rpx;
}

.start-time,
.end-time {
    font-size: 16rpx;
    color: #999;
    line-height: 1;
}

.section-num {
    font-size: 24rpx;
    font-weight: bold;
    color: #999;
    line-height: 1;
}

.course-swpier {
    flex: 1;
    height: 1200rpx;
}

.course-list {
    flex: 1;
    position: relative;
    height: 1200rpx;
}

.course-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
}

.grid-line {
    position: absolute;
    width: 100%;
    border-bottom: 1px dashed #ebebeb;
    height: 120rpx;
}

.course-item {
    position: absolute;
    box-sizing: border-box;
    padding: 4rpx;
    pointer-events: none;
    z-index: 2;
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
    z-index: 3;
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

.setting-popup-content {
    background-color: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 20rpx;
    padding-bottom: 40rpx;
    box-sizing: border-box;
}

:deep(.uni-popup) {
    z-index: 1000 !important;
}

:deep(.uni-list-item__content-title) {
    font-size: 30rpx !important;
    padding-left: 15rpx;
}

:deep(.uni-list-item) {
    padding: 10rpx 0 !important;
}

.mask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 101;
    height: v-bind('`calc(${paddingTopStyle} + 2000px)`');
    background-color: rgba(0, 0, 0, 0);
}
</style>