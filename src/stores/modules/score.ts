import { defineStore } from 'pinia'
import { ref } from 'vue'

interface GradeItem {
    list: Array<any>
    xfjd: string
}

export const useScoreStore = defineStore(
    'score',
    () => {
        const gradeItem = ref<Array<Array<GradeItem>>>(Array.from({ length: 10 }, () => Array(3).fill(null)))
        const selectedIndexes = ref<Array<number>>([])

        const set = (dto: GradeItem, indexes: Array<number>) => {
            gradeItem.value[indexes[0]][indexes[1]] = dto
            selectedIndexes.value = indexes
        }

        const clear = () => {
            gradeItem.value = [[]]
            selectedIndexes.value = []
        }

        return {
            gradeItem,
            selectedIndexes,
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
