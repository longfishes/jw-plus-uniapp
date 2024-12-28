<script>
import { useMemberStore } from '@/stores'
import { http } from '@/utils/http'

const memberStore = useMemberStore()

export default {
  data() {
    return {
      baseFormData: {
        username: memberStore.profile.username,
        password: memberStore.profile.password,
      },
    }
  },
  methods: {
    async submit() {
      if (!this.baseFormData.username) {
        uni.showToast({
          icon: 'none',
          title: '请输入用户名'
        })
        return;
      }
      if (!this.baseFormData.password) {
        uni.showToast({
          icon: 'none',
          title: '请输入密码'
        })
        return;
      }
      const res = await http({
        method: 'POST',
        url: '/auth/token',
        data: this.baseFormData
      }, true)

      memberStore.setProfile({ username: this.baseFormData.username, password: this.baseFormData.password, token: res.data })
      uni.navigateBack({})
      uni.showToast({ title: '绑定成功' })
    },
  }
}
</script>

<template>
  <uni-section title="登录" type="line">
    <view class="form">

      <uni-forms label-position="left">
        <uni-forms-item label="用户名" required>
          <uni-easyinput v-model="baseFormData.username" placeholder="请输入用户名" />
        </uni-forms-item>
        <uni-forms-item label="密码" required>
          <uni-easyinput v-model="baseFormData.password" placeholder="请输入密码" />
        </uni-forms-item>
      </uni-forms>
      <button style="color: #2979ff;border-color: #2979ff" plain size="" @click="submit()">保存</button>
    </view>
  </uni-section>
</template>

<style scoped lang="scss">
.form {
  padding: 15px;
  background-color: #fff;
}
</style>
