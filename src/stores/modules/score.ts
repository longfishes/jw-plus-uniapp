import { defineStore } from 'pinia'
import { ref } from 'vue'

interface GradeItem {
    list: Array<any>
    xfjd: string
}

function calcGPA(data: any) {
    if (!data || !Array.isArray(data.list) || data.list.length === 0) {
        return "0.00";
    }

    let totalWeightedPoints = 0; // 累加绩点*学分
    let totalCredits = 0;        // 累加学分

    data.list.forEach((item: any) => {
        const jd = parseFloat(item.jd); // 绩点
        const xf = parseFloat(item.xf); // 学分
        if (!isNaN(jd) && !isNaN(xf)) {
            totalWeightedPoints += jd * xf;
            totalCredits += xf;
        }
    });

    return totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2).toString() : "0.00";
}

function filter(data: any, xnm: string, xqm: string) {
    if (!data || !Array.isArray(data.list)) {
        return { list: [] };
    }

    return {
        list: data.list.filter((item: any) => {
            const matchXnm = xnm === "" || item.xnm === xnm;
            const matchXqm = xqm === "" || item.xqm === xqm;
            return matchXnm && matchXqm;
        })
    };
}

export const useScoreStore = defineStore(
    'score',
    () => {
        const gradeItem = ref<Array<Array<GradeItem>>>(Array.from({ length: 10 }, () => Array(3).fill(null)))
        const selectedIndexes = ref<Array<number>>([])

        const set = (dto: GradeItem, indexes: Array<number>) => {
            gradeItem.value[indexes[0]][indexes[1]] = dto
            if (indexes[1] == 2) { // 查询全年
                // 筛选上半年
                let firstStep = filter(dto, '', '3')
                if (firstStep.list.length != 0) {
                    let firstGPA: string = calcGPA(firstStep) as string
                    (firstStep as GradeItem).xfjd = firstGPA
                    gradeItem.value[indexes[0]][0] = firstStep as GradeItem
                }

                // 筛选下半年
                let secondStep = filter(dto, '', '12')
                if (secondStep.list.length != 0) {
                    let secondGPA: string = calcGPA(secondStep) as string
                    (secondStep as GradeItem).xfjd = secondGPA
                    gradeItem.value[indexes[0]][1] = secondStep as GradeItem
                }

            } else { // 查询上半年或下半年
                // 合并数组
                let combinedArray
                if (indexes[1] == 0) { // 上半年
                    combinedArray = [
                        ...dto.list,
                        ...(gradeItem?.value?.[indexes[0]]?.[2]?.list ?? [])
                    ]
                } else { // 下半年
                    combinedArray = [
                        ...(gradeItem?.value?.[indexes[0]]?.[2]?.list ?? []),
                        ...dto.list
                    ]
                }
                // 去重
                const allList = combinedArray.reduce((acc, item) => {
                    if (!acc.some((existingItem: any) => existingItem.kcmc === item.kcmc)) {
                        acc.push(item);
                    }
                    return acc;
                }, []);
                // 创建对象
                const fullStep = allList.length == 0 ? null : { list: allList, xfjd: calcGPA({ list: allList }) }
                // 存入storage
                gradeItem.value[indexes[0]][2] = fullStep as GradeItem
            }
            selectedIndexes.value = indexes
        }

        const setIndexes = (indexes: Array<number>) => {
            selectedIndexes.value = indexes
        }

        const clear = () => {
            gradeItem.value = Array.from({ length: 10 }, () => Array(3).fill(null))
            selectedIndexes.value = []
        }

        return {
            gradeItem,
            selectedIndexes,
            setIndexes,
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
