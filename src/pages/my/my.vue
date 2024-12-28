<script setup lang="ts">
import { useMemberStore } from '@/stores'
import { http } from '@/utils/http'

const memberStore = useMemberStore()

const getData: any = async () => {
  const res = await http({
    method: 'GET',
    url: '/member/profile',
  })
  console.log(res)
}

const onCleanTapped: any = () => {
  memberStore.clearProfile()
}

</script>

<template>
  <view class="my">
    <view>会员信息：{{ memberStore.profile }}</view>
    <button @tap="
      memberStore.setProfile({ username: 'test', password: 'test' })
      " size="mini" plain type="primary">
      保存用户信息

    </button>
    <button @tap="onCleanTapped()" size="mini" plain type="warn">清理用户信息</button>
    <button @tap="getData()" size="mini" plain type="primary">测试请求</button>
  </view>
</template>

<style lang="scss"></style>
