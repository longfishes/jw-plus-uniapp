<template>
  <view class="uni-list-cell-db">
    <button @click="changeBox" type="default">点击选择: {{ arr[val[0]] }}</button>
    <view v-show="visible">
      <picker-view :value="val" @pickend="pickend" @pickstart="pickstart" @change="bindChange" class="picker-view">
        <picker-view-column>
          <view class="item" v-for="(item, index) in arr" :key="index">{{ item }}</view>
        </picker-view-column>
      </picker-view>
      <button @click="changeBox" type="default">确定</button>
    </view>
  </view>
</template>

<script>
let arr = [];
for (var i = 0; i < 100; i++) {
  arr.push(i)
}

export default {
  data() {
    return {
      arr,
      val: [],
      visible: false,
    }
  },
  methods: {
    changeBox() {
      this.visible = !this.visible
    },
    bindChange: function (e) {
      console.log('索引：' + e.target.value)
      this.val = e.target.value;
      // ...
    }
  }
}
</script>

<style scoped lang="scss">
button {
  margin: 0 30rpx;
}

.picker-view {
  width: 100vw;
  height: 600rpx;
  margin-top: 200rpx;
}

.item {
  text-align: center;
}
</style>