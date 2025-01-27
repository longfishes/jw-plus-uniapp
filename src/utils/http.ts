import { useMemberStore } from "@/stores";

// 请求拦截器
const baseURL = 'https://jwplus.longfish.site/api'
// const baseURL = 'http://localhost:7799'

const httpInterceptor = {
    // 拦截前触发
    invoke(options: UniApp.RequestOptions) {

        // 基地址
        if (!options.url.startsWith('http') || !options.url.startsWith('https')) {
            if (options.url.startsWith('/')) options.url = baseURL + options.url
            else options.url = baseURL + '/' + options.url;
        }

        // 请求超时时间 默认：60s
        options.timeout = 30 * 1000

        // 请求头
        options.header = {
            ...options.header,
            // 'Base-Url': 'http://jwxt.gcc.edu.cn'
        }

        // Token
        const memberStore = useMemberStore()
        const token = memberStore.profile?.token
        if (token) {
            options.header.Authorization = token
        }
    }
}

uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

// 响应拦截器
interface Data<T> {
    code: string
    msg: string
    data: T
}

export const http = <T>(options: UniApp.RequestOptions, loading: boolean) => {
    // 1. 返回 Promise 对象
    return new Promise<Data<T>>((resolve, reject) => {
        if (loading) {
            uni.showLoading({
                title: '获取中...',
                mask: true,
            });
        }
        uni.request({
            ...options,
            // 响应成功
            success(res) {
                if ((res.data as any).msg == '未认证') {
                    uni.navigateTo({ url: '/pages/login/login' })
                    uni.showToast({
                        icon: 'none',
                        title: '请先登录'
                    })
                    reject(res)
                    return;
                }
                // 状态码 2xx, 后端返回code不为0
                if ((res.data as any).code != 0 && res.statusCode >= 200 && res.statusCode < 300) {
                    // 2.1 提取核心数据 res.data
                    resolve(res.data as Data<T>)
                } else if (res.statusCode === 401) {
                    // 401错误  -> 跳转到登录页
                    uni.navigateTo({ url: '/pages/login/login' })
                    uni.showToast({
                        icon: 'none',
                        title: '请先登录'
                    })
                    reject(res)
                } else {
                    if ((res.data as any).msg == '账号或密码错误！') {
                        uni.showToast({
                            icon: 'error',
                            title: (res.data as Data<T>).msg || '请求错误',
                        })
                    }
                    else {
                        // 其他错误 -> 根据后端错误信息轻提示
                        uni.showToast({
                            icon: 'none',
                            title: (res.data as Data<T>).msg || '请求错误',
                        })
                    }
                    reject(res)
                }
            },
            // 响应失败
            fail(err) {
                uni.showToast({
                    icon: 'none',
                    title: '网络错误，换个网络试试',
                })
                reject(err)
            },
        })
    })
}