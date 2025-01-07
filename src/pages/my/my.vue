<script setup lang="ts">
import { useMemberStore } from '@/stores'
import { http } from '@/utils/http'

const memberStore = useMemberStore()

const getData: any = async () => {
  const res = await http({
    method: 'GET',
    url: '/member/profile',
  }, false)
  console.log(res)
}

const onCleanTapped: any = () => {
  memberStore.clearProfile()
}

const onSaveTapped: any = () => {
  uni.showToast({
    icon: 'none',
    title: '保存'
  })
}

</script>

<template>
  <view class="my">
    <view>{{ memberStore.profile }}</view>
    <button @tap="onSaveTapped()" size="mini" plain type="primary">
      保存用户信息

    </button>
    <button @tap="onCleanTapped()" size="mini" plain type="warn">清理用户信息</button>
    <button @tap="getData()" size="mini" plain type="primary">测试请求</button>
  </view>
</template>

<style lang="scss"></style>
