<template>
  <ExamList kcmc="今天的一个考试" location="钟海楼03028(多)" datetime="2025-01-11(14:00-15:30)" />
  <ExamList kcmc="一个紧急的考试" location="钟海楼03028(多)" datetime="2025-01-12(14:30-16:30)" />
  <ExamList kcmc="马克思主义基本原理" location="钟海楼03028(多)" datetime="2025-01-22(14:30-16:30)" />
  <ExamList kcmc="今天的另一个考试" location="钟海楼03028(多)" datetime="2025-01-11(13:30-14:30)" />
  <ExamList kcmc="中国近代史纲要" location="钟海楼03028(多)" datetime="2025-01-07(14:30-16:30)" />
</template>

<script>
import ExamList from '@/components/ExamList.vue'

export default {
  components: {
    ExamList
  },

}
</script>

<style scoped></style>