<script>
import { useMemberStore } from '@/stores'
import { useScoreStore } from '@/stores'
import { http } from '@/utils/http'
import GradeList from '@/components/GradeList.vue';

function round(number) {
  return (Math.round(number * 100) / 100).toFixed(2);
}

export default {
  components: {
    GradeList
  },
  data() {
    return {
      scollable: true,
      data: [],
      selectedName: '',
      gradeItem: {
        list: [],
        xfjd: ''
      },
      selectedIndex: [0, 0],
    }
  },
  computed: {
    result() {
      return this.calcPrefer()
    },

    truncatedData() {
      return this.data.slice(0, this.data.length - 1);
    },

    multiArray() {
      const yearMapping = {
        '1': ['大一'],
        '2': ['大一', '大二'],
        '3': ['大一', '大二', '大三'],
        '4': ['大一', '大二', '大三', '大四']
      };

      const yearKey = this.result.charAt(0);
      const baseYear = this.getMyYear();
      const additionalYears = parseInt(yearKey, 10);
      const years = additionalYears <= 4
        ? yearMapping[yearKey]
        : yearMapping['4'].concat(
          Array.from({ length: additionalYears - 4 }, (_, i) => baseYear + 4 + i)
        );

      return [
        years || ['大一', '大二', '大三', '大四'],
        ['上', '下', '全']
      ];
    },


    multiIndex() {
      return this.selectedIndex
    }
  },
  methods: {
    popChange(e) {
      this.scollable = !e.show
    },
    getMyYear() {
      const currentYear = new Date().getFullYear()
      const username = this.memberStore.profile.username

      if (!username || username.length < 4 || isNaN(parseInt(username.substring(0, 4)))) {
        return currentYear - 4
      }

      return parseInt(username.substring(0, 4))
    },
    calcPrefer() {
      const myYear = this.getMyYear()
      const month = new Date().getMonth() + 1
      const year = new Date().getFullYear()

      if (myYear === year) {
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
    },
    updateSelectedIndex() {
      const username = this.memberStore.profile.username
      if (!username || username.length < 4 || isNaN(parseInt(username.substring(0, 4)))) {
        this.selectedIndex = [0, 0]
        return;
      }
      const newSelectedIndex = [this.result.charAt(0) - 1, this.result.charAt(1) - 1]
      this.selectedIndex = newSelectedIndex
    },
    toggle(index) {
      this.data = this.gradeItem.list[index].details
      this.selectedName = this.gradeItem.list[index].kcmc
      this.$refs.popup.open('bottom')
    },
    togglePicker() {
      this.$refs.pickerPop.open('bottom')
    },
    async query() {
      const index = this.multiIndex[1]
      const xnm = parseInt(this.getMyYear()) + this.multiIndex[0]
      const xqm = index === 0 ? '3' : index === 1 ? '12' : ''

      const res = await http({
        method: 'POST',
        url: '/grade/option',
        data: { 'xnm': xnm, 'xqm': xqm }
      }, true)
      if (res.data.list.length != 0) {
        res.data.xfjd = round(res.data.xfjd)
        this.gradeItem = { list: [], xfjd: '' }
        setTimeout(() => {
          this.gradeItem = res.data
        }, 200);
        this.scoreStore.set(res.data, this.selectedIndex)
      }
    },
    showPicker() {
      this.togglePicker()
    },
    submitChange(value) {
      if (!this.multiArray[0][value[0]] || !this.multiArray[1][value[1]]) {
        value = this.selectedIndex
      }

      this.selectedIndex = value
      this.scoreStore.setIndexes(this.selectedIndex)
      if (!this.scoreStore.gradeItem[value[0]][value[1]]) {
        this.gradeItem = { list: [], xfjd: '' }
      } else {
        this.gradeItem = { list: [], xfjd: '' }
        setTimeout(() => {
          this.gradeItem = this.scoreStore.gradeItem[value[0]][value[1]]
        }, 200);
      }
    },
    bindChange(e) {
      this.unsubmitElement = e
    },
    submitBnclicked() {
      if (!this.unsubmitElement) {
        this.submitChange(this.selectedIndex)
      } else {
        this.submitChange(this.unsubmitElement.target.value)
      }
      this.$refs.pickerPop.close();
    }
  },
  watch: {

  },
  created() {
    this.memberStore = useMemberStore()
    this.scoreStore = useScoreStore()
  },
  onShow() {
    if (this.scoreStore.selectedIndexes.length != 2) {
      this.updateSelectedIndex()
    } else {
      this.selectedIndex = this.scoreStore.selectedIndexes
    }

    if (this.scoreStore.selectedIndexes.length == 2
      && this.scoreStore.gradeItem[this.scoreStore.selectedIndexes[0]][this.scoreStore.selectedIndexes[1]]) {
      this.selectedIndex = this.scoreStore.selectedIndexes
      this.gradeItem = this.scoreStore.gradeItem[this.selectedIndex[0]][this.selectedIndex[1]]
    }

    if (!this.multiArray[0][this.multiIndex[0]] || !this.multiArray[1][this.multiIndex[1]]) {
      this.updateSelectedIndex()
      this.scoreStore.selectedIndexes = this.selectedIndex
    }
  },
}
</script>


<template>
  <page-meta :page-style="'overflow:' + (scollable ? 'visible' : 'hidden')"></page-meta>
  <view class="index">

    <view class="query-picker">
      <view class="uni-input" @tap="showPicker">
        <span class="placeholder">&nbsp;&nbsp;学期</span>&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp;
        <span class="content">{{ multiArray[0][multiIndex[0]] + ' ' + multiArray[1][multiIndex[1]] }}</span>
        <span v-if="gradeItem.xfjd" style="font-weight: bold;">平均绩点&nbsp;&nbsp;{{ gradeItem.xfjd }}&nbsp;&nbsp;</span>
      </view>
    </view>

    <view class="searchBtn">
      <button style="color: #2979ff;border-color: #2979ff" plain size="" @click="query()">查询</button>
    </view>

    <view class="list">
      <uni-transition ref="ani" :mode-class="['fade', 'slide-right']" :show="gradeItem.list[0] != undefined">
        <uni-section v-if="gradeItem.list[0]">
          <GradeList v-for="(item, index) in gradeItem.list" :key="index" :title="item.kcmc"
            :note="item.xf + '学分 · ' + item.js + (item.khfs == null ? '' : (' · ' + item.khfs))" :rightText="item.cj"
            :rightNote="item.jd" @tap="toggle(index)" />
        </uni-section>
      </uni-transition>
    </view>

    <uni-transition ref="ani" :mode-class="['fade', 'slide-right']" :show="gradeItem.list[0] != undefined">
      <view class="divider-container" v-if="gradeItem.list[0]">
        <view class="divider-text">暂无更多数据</view>
      </view>
    </uni-transition>

    <view>
      <uni-popup ref="popup" background-color="#fff" :safeArea="false" @change="popChange">
        <uni-section :title="selectedName" type="line">
          <view class="detail-popup-content">
            <uni-table border stripe>
              <uni-tr v-for="(item, index) in truncatedData" :key="index">
                <uni-td align="center">{{ item.name }}&nbsp;({{ item.percent * 100 }}%)</uni-td>
                <uni-td align="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ item.score
                  }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</uni-td>
              </uni-tr>
            </uni-table>
          </view>
        </uni-section>
        <view style="padding: 25rpx;"></view>
      </uni-popup>
    </view>

    <view>
      <uni-popup ref="pickerPop" background-color="#fff" :safe-area="false" @change="popChange">
        <view class="popup-content">
          <picker-view ref="pickerView" :immediate-change="true" :value="multiIndex" @pickend="pickend"
            @pickstart="pickstart" @change="bindChange" class="picker-view" indicator-style="height: 50px;">
            <picker-view-column>
              <view class="item" v-for="(item, index) in multiArray[0]" :key="index">{{ item }}</view>
            </picker-view-column>
            <picker-view-column>
              <view class="item" v-for="(item, index) in multiArray[1]" :key="index">{{ item }}</view>
            </picker-view-column>
          </picker-view>
        </view>
        <view class="popUpBtn">
          <button style="color: #2979ff;border-color: #2979ff" plain @click="submitBnclicked">确定</button>
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
  padding: 50rpx 50rpx 100rpx 50rpx;
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

.detail-popup-content {
  padding: 20px;
}

::v-deep {
  overflow-x: hidden;
}
</style>
