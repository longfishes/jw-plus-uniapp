<script setup lang="ts">
import { useMemberStore, useScoreStore } from '@/stores'

const memberStore = useMemberStore()
const scoreStore = useScoreStore()

const clearData: any = () => {
  scoreStore.clear()
}

const onCleanTapped: any = () => {
  uni.clearStorage()
}

const toLogin: any = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

const toExam: any = () => {
  uni.navigateTo({ url: '/pages/exam/exam' })
}

</script>

<template>
  <view class="my">
    <view>{{ memberStore.profile }}</view>
    <button @tap="toLogin()" size="mini" plain type="primary">跳转登录</button>
    <button @tap="toExam()" size="mini" plain type="warn">跳转考试日程</button>
    <button @tap="onCleanTapped()" size="mini" plain type="warn">清理用户信息</button>
    <button @tap="clearData()" size="mini" plain type="primary">清理缓存</button>
  </view>
</template>

<style lang="scss"></style>
