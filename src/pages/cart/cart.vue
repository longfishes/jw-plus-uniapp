<script setup>

const push = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

</script>

<template>
  <button @tap="push()" size="mini" plain type="primary">测试跳转</button>
</template>

<style scoped lang="scss"></style>
