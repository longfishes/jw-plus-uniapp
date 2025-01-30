<template>
  <uni-section :title="title" type="line" titleFontSize="28rpx">
    <view class="detail-popup-content">
      <view class="custom-table">
        <view class="table-row" v-for="(item, index) in data" :key="index">
          <view class="table-cell name-cell">
            {{ item.name }}&nbsp;({{ Math.round(item.percent * 100) }}%)
          </view>
          <view class="table-cell score-cell">
            {{ item.score }}
          </view>
        </view>
      </view>
    </view>
  </uni-section>
</template>

<script>
export default {
  name: 'ScoreDetail',
  props: {
    title: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
.detail-popup-content {
  padding: 20px;
}

.custom-table {
  width: 100%;
  border: 1px solid #2979ff;
  border-radius: 12rpx;
  
  .table-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #2979ff;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .table-cell {
    padding: 20rpx;
    text-align: center;
    font-size: 28rpx;
    color: #333;
  }
  
  .name-cell {
    flex: 1;
    border-right: 1px solid #2979ff;
  }
  
  .score-cell {
    flex: 1;
  }
}
</style> 