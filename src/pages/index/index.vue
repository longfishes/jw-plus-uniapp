<script>
import { useMemberStore } from '@/stores'
import { http } from '@/utils/http'

const memberStore = useMemberStore()
const myYear = memberStore.profile.username.substring(0, 4)

// 学年分界线：11月
// 上下半学期分界线：5月
function calcPrefer() {
  let curYear = -1
  let index = -1

  let month = new Date().getMonth() + 1
  let year = new Date().getFullYear()

  if (myYear == year) {
    return '11'
  }

  if (month >= 11 || month < 5) {
    if (month >= 11) {
      return (year - myYear + 1).toString() + '1'
    } else {
      return (year - myYear).toString() + '1'
    }
  } else {
    return (year - myYear).toString() + '2'
  }
}

const result = calcPrefer()

function getMultiArray() {
  if (result.charAt(0) == '1') return ['大一']
  if (result.charAt(0) == '2') return ['大一', '大二']
  if (result.charAt(0) == '3') return ['大一', '大二', '大三']
  if (result.charAt(0) == '4') return ['大一', '大二', '大三', '大四']
}

function getMultiIndex() {
  return [result.charAt(0) - 1, result.charAt(1) - 1]
}

export default {
  data() {
    return {
      data: '',
      multiArray: [
        getMultiArray(),
        ['上', '下', '全'],
      ],
      multiIndex: getMultiIndex(),
      gradeItem: {
        list: [],
        xfjd: ''
      },
    }
  },
  onReady() { },
  methods: {
    toggle(index) {
      this.data = this.gradeItem.list[index].details
      this.$refs.popup.open('bottom')
    },
    togglePicker() {
      this.$refs.pickerPop.open('bottom')
    },
    async query() {
      const index = this.multiIndex[1]
      const xnm = parseInt(myYear) + this.multiIndex[0]
      const xqm = index == 0 ? '3' : index == 1 ? '12' : ''

      const res = await http({
        method: 'POST',
        url: '/grade/option',
        data: { 'xnm': xnm, 'xqm': xqm }
      }, true)

      this.gradeItem = res.data
    },
    showPicker() {
      this.togglePicker()
    },
    bindChange: function (e) {
      this.multiIndex = e.target.value
    }
  }
}
</script>

<template>
  <view class="index">

    <view class="query-picker">
      <view class="uni-input" @tap="showPicker">
        <span class="placeholder">&nbsp;&nbsp;学期</span>&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp;
        <span class="content">{{ multiArray[0][multiIndex[0]] + ' ' + multiArray[1][multiIndex[1]] }}</span>
      </view>
    </view>

    <view class="searchBtn">
      <button style="color: #2979ff;border-color: #2979ff" plain size="" @click="query()">查询</button>
    </view>

    <view class="list">
      <uni-section v-if="gradeItem.list[0]">
        <uni-list>
          <uni-list-item v-for="(item, index) in gradeItem.list" :key="index" :title="item.kcmc"
            :note="item.xf + '学分 · ' + item.js + (item.khfs == null ? '' : (' · ' + item.khfs))" :rightText="item.cj"
            @tap="toggle(index)" />
        </uni-list>
      </uni-section>
    </view>

    <view class="divider-container" v-if="gradeItem.list[0]">
      <view class="divider-text">暂无更多数据</view>
    </view>


    <view>
      <uni-popup ref="popup" background-color="#fff">
        <view class="popup-content">
          {{ data }}
        </view>
      </uni-popup>
    </view>

    <view>
      <uni-popup ref="pickerPop" background-color="#fff">
        <view class="popup-content">
          <picker-view :value="multiIndex" @pickend="pickend" @pickstart="pickstart" @change="bindChange"
            class="picker-view" indicator-style="height: 50px;" mask-style="padding: 10px 0">
            <picker-view-column>
              <view class="item" v-for="( item, index ) in  multiArray[0] " :key="index">{{ item }}</view>
            </picker-view-column>
            <picker-view-column>
              <view class="item" v-for="( item, index ) in  multiArray[1] " :key="index">{{ item }}</view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="popUpBtn">
          <button style="color: #2979ff;border-color: #2979ff" plain size="" @click="this.$refs.pickerPop.close();
      ">确定</button>
        </view>
      </uni-popup>
    </view>

  </view>

</template>

<style scoped lang="scss">
.searchBtn {
  margin-top: 50rpx;
  margin-left: 50rpx;
  margin-right: 50rpx;
}

.popUpBtn {
  margin: 50rpx;
}

.query-picker {
  display: inline-block;
  width: auto;
}

.uni-input {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 50rpx;
  margin-left: 50rpx;
  margin-right: 50rpx;
  width: 650rpx;
  background-color: #f9f9f9;
  font-size: 14px;
  color: #aaa;
  box-sizing: border-box;
}

.uni-input .placeholder {
  font-weight: bold;
  margin-right: 4px;
  white-space: nowrap;
}

.uni-input .content {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 50rpx;
  padding-bottom: 100rpx;
  position: relative;
}

.divider-container::before,
.divider-container::after {
  content: '';
  flex: 1;
  height: 1rpx;
  background-color: #e0e0e0;
}

.divider-text {
  padding: 0 20rpx;
  font-size: 24rpx;
  color: #999;
  white-space: nowrap;
}

.picker-view {
  width: 750rpx;
  height: 500rpx;
}

.item {
  line-height: 100rpx;
  text-align: center;
}
</style>
