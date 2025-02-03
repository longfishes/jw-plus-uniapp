<template>
  <view class="background" v-if="show">
    <view class="title">设置课表壁纸</view>
    <view class="tips">用户可上传喜欢的图片作为课表的背景展示(点击切换图片)</view>
    
    <view class="wallpaper-grid">
      <!-- 默认壁纸选项列表 -->
      <view class="wallpaper-item" 
            v-for="(item, index) in defaultWallpapers" 
            :key="index"
            @click="selectBackground(index)">
        <view class="wallpaper-preview" :class="{ active: currentIndex === index }">
          <!-- 纯色背景显示 -->
          <view v-if="item.isSolidColor" 
                class="solid-color-preview"
                :style="{ backgroundColor: item.color }"></view>
          
          <!-- 图片背景显示 -->
          <template v-else>
            <image 
              v-if="item.preview"
              :src="item.preview" 
              mode="aspectFill"
              @load="handleImageLoad(item.preview)"
              @error="handleImageError(item.preview)"
            />
            <view class="loading-spinner" 
                  v-if="item.preview && !loadedImages.includes(item.preview) && !errorImages.includes(item.preview)"></view>
            <view v-if="errorImages.includes(item.preview)" class="error-tip">
              <text>加载失败</text>
            </view>
          </template>
        </view>
        <text>{{ item.name }}</text>
      </view>

      <!-- 自定义壁纸选项 -->
      <view class="wallpaper-item" @click="handleCustomWallpaper">
        <view class="wallpaper-preview custom" :class="{ active: currentIndex === -1 }">
          <image 
            v-if="customImage" 
            :src="customImage" 
            mode="aspectFill"
            @load="handleImageLoad(customImage)"
            @error="handleImageError(customImage)"
          />
          <view class="loading-spinner" 
                v-if="customImage && !loadedImages.includes(customImage) && !errorImages.includes(customImage)"></view>
          <view v-else class="upload-icon">
            <text>上传图片</text>
          </view>
          <view v-if="errorImages.includes(customImage)" class="error-tip">
            <text>加载失败</text>
          </view>
        </view>
        <text>自定义壁纸</text>
      </view>

    </view>

  </view>
</template>

<script>
import { useSettingStore } from '@/stores/modules/setting';
import { defaultWallpapers } from '@/config/background';

const settingStore = useSettingStore()

export default {
  data() {
    return {
      show: false,
      currentIndex: 0,
      customImage: '',
      defaultWallpapers: defaultWallpapers,
      loadedImages: [],
      errorImages: [],
    }
  },
  methods: {
    handleImageLoad(src) {
      if (!this.loadedImages.includes(src)) {
        this.loadedImages = [...this.loadedImages, src]
        this.errorImages = this.errorImages.filter(item => item !== src)
      }
    },
    handleImageError(src) {
      if (!this.errorImages.includes(src)) {
        this.errorImages = [...this.errorImages, src]
        this.loadedImages = this.loadedImages.filter(item => item !== src)
      }
    },
    selectBackground(index) {
      this.currentIndex = index;
    },
    handleCustomWallpaper() {
      if (!this.customImage) {
        // 如果没有自定义图片，调用上传图片
        this.uploadImage();
      } else if (this.currentIndex === -1) {
        // 如果已经选中且有图片，则重新上传
        this.uploadImage();
      } else {
        // 如果有图片但未选中，则切换选中状态
        this.currentIndex = -1;
      }
    },
    uploadImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          // 上传文件
          uni.uploadFile({
            url: '/upload',
            filePath: res.tempFilePaths[0],
            name: 'file',
            success: (result) => {
              const imageUrl = JSON.parse(result.data).data;
              uni.setStorageSync('customImage', imageUrl);
              this.customImage = imageUrl;
              this.currentIndex = -1;
            },
            fail: (error) => {
              uni.showToast({
                title: '上传失败',
                icon: 'none'
              });
            }
          });
        }
      });
    },
    submit() {
      settingStore.set({ backgroundIndex: this.currentIndex });
      uni.$emit('swichAppearance');
    }
  },
  onLoad() {
    this.currentIndex = settingStore.settings.backgroundIndex;
    this.customImage = uni.getStorageSync('customImage');
  },
  mounted() {
    this.show = true;
  },
  onHide() {
    this.submit();
  },
  onUnload() {
    this.submit();
  }
}
</script>

<style scoped>
.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.background {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.tips {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  padding: 0 20rpx;
}

.wallpaper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 6rpx;
}

.solid-color-preview {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.error-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff4d4f;
  font-size: 24rpx;
  text-align: center;
  white-space: nowrap;
}

.wallpaper-preview {
  width: 200rpx;
  height: 280rpx;
  border-radius: 20rpx;
  border: 2rpx solid #ddd;
  background-color: #dcdcdc;
  box-sizing: border-box;
  position: relative;
}

.wallpaper-preview image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.wallpaper-preview::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
}

.wallpaper-preview.active {
  border-color: transparent;
}

.wallpaper-preview.active::before {
  content: '';
  position: absolute;
  top: -6rpx;
  left: -6rpx;
  right: -6rpx;
  bottom: -6rpx;
  border: 6rpx solid #007AFF;
  border-radius: 22rpx;
  pointer-events: none;
  z-index: 1;
}

.wallpaper-preview.custom {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eee;
}

.wallpaper-preview.custom image {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18rpx;
}

.upload-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
}

.wallpaper-item text {
  font-size: 28rpx;
  color: #333;
}

image {
  width: 100%;
  height: 100%;
}
</style>
