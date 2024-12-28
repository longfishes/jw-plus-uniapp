import { defineStore } from 'pinia'
import { ref } from 'vue'

interface AccountDTO {
  username: string
  password: string
  token: string
}

export const useMemberStore = defineStore(
  'member',
  () => {
    const profile = ref<AccountDTO>({ username: '', password: '', token: '' })

    const setProfile = (accountDTO: AccountDTO) => {
      if (accountDTO.username) profile.value.username = accountDTO.username
      if (accountDTO.password) profile.value.password = accountDTO.password
      if (accountDTO.token) profile.value.token = accountDTO.token



    }

    const clearProfile = () => {
      profile.value = { username: '', password: '', token: '' }
    }

    return {
      profile,
      setProfile,
      clearProfile,
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
