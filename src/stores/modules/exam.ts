import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ExamItem {
    kcmc: string
    cdmc: string
    kssj: string
    xf: string
    xnm: string
    xqm: string
}

export const useExamStore = defineStore(
    'exam',
    () => {
        const examList = ref<Array<ExamItem>>([])

        const set = (list: Array<ExamItem>) => {
            examList.value = list
        }

        const clear = () => {
            examList.value = []
        }

        return {
            examList,
            set,
            clear,
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
