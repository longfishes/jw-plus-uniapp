<template>
  <view class="sticky-content" style="position: sticky; top: 0; z-index: 1000; background-color: #ffffff;">
    <view class="header" @tap="queryOptions(false)">
      <view class="header-left">点击或下拉刷新 <uni-icons type="arrow-right" size="15" color="gray" />
      </view>
      <view class="header-right">
        <uni-icons type="loop" size="15" color="gray" />
      </view>
    </view>
  </view>

  <uni-transition ref="ani" :mode-class="['fade', 'slide-right']" :show="examList.length > 0">
    <view v-if="examList.length > 0">
      <view v-if="groupedExamList.length > 0">
        <uni-section v-for="(exams, index) in groupedExamList" :key="index"
          :title="`大${toChineseNumber(mapXnm(exams[0].xnm))} - 第${mapXqm(exams[0].xqm)}学期`" type="line">
          <ExamList v-for="(item, subIndex) in exams" :key="subIndex" :kcmc="item.kcmc" :location="item.cdmc"
            :datetime="item.kssj" />
        </uni-section>
      </view>
      <Divider text="暂无更多数据" />
      <view style="height: 10px;"></view>
    </view>
  </uni-transition>
</template>

<script>
import ExamList from '@/components/ExamList.vue'
import Divider from '@/components/Divider.vue'
import { useExamStore } from '@/stores'
import { http } from '@/utils/http'

const examStore = useExamStore()

export default {
  components: {
    ExamList,
    Divider
  },
  data() {
    return {
      examList: [],          // 原始考试数据
      groupedExamList: [],   // 按 xnm 和 xqm 分类后的考试数据
      minXnm: null           // 学年中最小的年份（用于计算大几）
    }
  },
  methods: {
    async queryOptions(isPulldown) {
      const res = await http({
        method: 'POST',
        url: '/exam/option',
        data: { xnm: '', xqm: '' }
      }, !isPulldown)

      this.examList = [] // 清空原有数据
      setTimeout(() => {
        this.examList = res.data
        this.groupExamList() // 分类考试数据
      }, 200)
      examStore.set(res.data)

      if (isPulldown) uni.stopPullDownRefresh()
    },

    // 按 xnm 和 xqm 分类考试数据
    groupExamList() {
      if (this.examList.length === 0) return

      // 找出最小的学年，用于计算年级
      this.minXnm = Math.min(...this.examList.map(exam => exam.xnm))

      const grouped = Object.values(
        this.examList.reduce((acc, exam) => {
          const key = `${exam.xnm}-${exam.xqm}`
          if (!acc[key]) {
            acc[key] = []
          }
          acc[key].push(exam)
          return acc
        }, {})
      )
      this.groupedExamList = grouped
    },

    // 学期映射方法：将 3 和 12 映射为 1 和 2
    mapXqm(xqm) {
      const mapping = {
        3: 1,  // 第3学期映射为第1学期
        12: 2  // 第12学期映射为第2学期
      }
      return mapping[xqm] || xqm // 如果没有匹配到映射值，返回原值
    },

    // 学年映射方法：根据最小年份计算大几
    mapXnm(xnm) {
      if (this.minXnm === null) return '' // 如果没有最小年份，返回空字符串
      const grade = xnm - this.minXnm + 1  // 计算大几
      return grade
    },

    // 将数字转换为中文数字的方法
    toChineseNumber(num) {
      const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
      return num
        .toString()
        .split('')
        .map(digit => chineseNumbers[parseInt(digit)])
        .join('')
    }
  },
  onPullDownRefresh() {
    this.queryOptions(true)
  },
  onShow() {
    this.examList = examStore.examList || [] // 确保 examList 不为空
    if (this.examList.length > 0) {
      this.groupExamList()
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  margin: 15px;
  border: 1px solid #2979ff;
  border-radius: 8px;
}

.header-left {
  font-size: 14px;
  color: gray;
}

.header-right {
  width: 20px;
  height: 20px;
}
</style>
