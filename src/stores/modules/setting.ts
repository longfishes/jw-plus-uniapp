import { defineStore } from 'pinia'
import { ref } from 'vue'
import { defaultColors, defaultStartTimes, defaultEndTimes } from '@/config/defaults'

interface Settings {
    showGridLines: boolean  // 课表网格线显示控制
    showOtherWeek: boolean  // 显示非本周课程
    showStartTime: boolean  // 显示上课时间
    showEndTime: boolean  // 显示下课时间
    colors: string[]  // 课程颜色
    backgroundIndex: number  // 背景图片索引
}

export const useSettingStore = defineStore(
    'setting',
    () => {
        const settings = ref<Settings>({
            showGridLines: true,  // 默认显示网格线
            showOtherWeek: true,  // 默认显示非本周课程
            showStartTime: true,  // 默认显示上课时间
            showEndTime: true,  // 默认显示下课时间
            colors: [...defaultColors],
            backgroundIndex: 0,
        })

        const set = (newSettings: Partial<Settings>) => {
            settings.value = {
                ...settings.value,
                ...newSettings
            }
        }

        const reset = () => {
            settings.value = {
                showGridLines: true,
                showOtherWeek: true,
                showStartTime: true,
                showEndTime: true,
                colors: [...defaultColors],
                backgroundIndex: 0,
            }
        }

        return {
            settings,
            set,
            reset,
        }
    },
    {
        persist: {
            storage: {
                setItem(key, value) {
                    uni.setStorageSync(key, value)
                },
                getItem(key) {
                    return uni.getStorageSync(key)
                },
            },
        },
    },
)
