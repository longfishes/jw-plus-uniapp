<script>
import { useMemberStore, useScoreStore } from '@/stores'
import { http } from '@/utils/http'

const memberStore = useMemberStore()
const scoreStore = useScoreStore()

export default {
  data() {
    return {
      baseFormData: {
        username: memberStore.profile.username,
        password: memberStore.profile.password,
      },
      isFocused: false,
      isFocused2: false,
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

      if (this.baseFormData.username != memberStore.profile.username) {
        scoreStore.clear()
      }
      memberStore.setProfile({ username: this.baseFormData.username, password: this.baseFormData.password, token: res.data })
      uni.navigateBack({})
      uni.showToast({ title: '绑定成功' })
    },
    clearUsername() {
      this.baseFormData.username = '';
    },
    clearPassword() {
      this.baseFormData.password = '';
    },
  }
}
</script>

<template>
  <uni-section title="绑定教务系统" type="line">
    <view class="form">
      <uni-forms label-position="left">
        <uni-forms-item>
          <view class="custom-input" :class="{ 'focused': isFocused }" @tap="isFocused = true">
            <span class="input-label">&nbsp;&nbsp;账号</span>&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp;
            <input ref="usernameInput" v-model="baseFormData.username" placeholder="请输入账号" @focus="isFocused = true"
              @blur="isFocused = false" :focus="isFocused" />
            <span v-if="baseFormData.username" class="clear-btn" @click="clearUsername">×</span>
          </view>
        </uni-forms-item>
        <uni-forms-item>
          <view class="custom-input" :class="{ 'focused': isFocused2 }" @tap="isFocused2 = true">
            <span class="input-label">&nbsp;&nbsp;密码</span>&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp;
            <input ref="passwordInput" v-model="baseFormData.password" placeholder="请输入密码" type="password"
              @focus="isFocused2 = true" @blur="isFocused2 = false" :focus="isFocused2" />
            <span v-if="baseFormData.password" class="clear-btn" @click="clearPassword">×</span>
          </view>
        </uni-forms-item>
      </uni-forms>
      <button style="margin-top: 60rpx; color: #2979ff; border-color: #2979ff" plain size=""
        @click="submit()">保存</button>
    </view>
  </uni-section>
</template>

<style scoped lang="scss">
.form {
  padding: 15rpx 50rpx;
  background-color: #fff;
}

.custom-input {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 8px;
  background-color: #f9f9f9;
  font-size: 14px;
  color: #aaa;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  transition: border 0.3s ease, box-shadow 0.3s ease;
}

.custom-input.focused {
  border: 1px solid #2979ff;
  box-shadow: 0 0 5px rgba(41, 121, 255, 0.5);
}

.input-label {
  font-weight: bold;
  color: #aaa;
  white-space: nowrap;
  margin-right: 8px;
}

.custom-input input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
  padding-right: 30px;
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #888;
  cursor: pointer;
  user-select: none;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0);
  line-height: 20px;
  text-align: center;
}

.clear-btn:hover {
  color: #fd0000;
}

::v-deep {
  overflow: hidden;
}
</style>
