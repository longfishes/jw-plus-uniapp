<template>
  <uni-card :is-shadow="true">
    <text class="uni-body">这是一个基础卡片示例，内容较少，此示例展示了一个卡片。</text>
    <uni-tag :inverted="true" text="标签" type="primary" />
    <uni-tag :inverted="true" text="标签" />
  </uni-card>

  <Progress 
    v-model:value="currentValue" 
    :max="20"
    color="#2979ff"
  />
</template>

<script>
import Progress from '@/components/Progress.vue'

export default {
    components: {
        Progress
    },
    data() {
        return {
            currentValue: 1
        }
    }
}
</script>

<style scoped lang="scss"></style>