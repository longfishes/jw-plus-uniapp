import { defineStore } from 'pinia'
import { ref } from 'vue'

interface GradeItem {
    list: Array<any>
    xfjd: string
    selectedIndexex: Array<Number>
}

export const useScoreStore = defineStore(
    'score',
    () => {
        const gradeItem = ref<GradeItem>({ list: [], xfjd: '', selectedIndexex: [] })
        const selectedIndexes = ref<Array<Number>>([])

        const set = (dto: GradeItem, indexes: Array<Number>) => {
            gradeItem.value = dto
            selectedIndexes.value = indexes
        }

        const clear = () => {
            gradeItem.value = { list: [], xfjd: '', selectedIndexex: [] }
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
