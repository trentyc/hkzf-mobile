/* 
1. 优先去localStorae中获取当前城市的信息
2. 如果有， 直接返回改城市的信息
3. 如果没有，就调用百度地图的API去定位当前城市
4. 发送ajax请求，得到真实的城市嘻嘻，再返回
5. 获取到城市信息，记得往缓存中存一份
*/

import axios from 'axios'
// 防止写错
const CURRENT_CITY = 'current_city'

export function setCity(city) {
  localStorage.setItem(CURRENT_CITY, JSON.stringify(city))
}

export function getCurrentCity(callback) {
  // 因为获取数据是个异步操作，需要直接返回一个承诺
  return new Promise((resolve, reject) => {
    // 方法1： 看缓存中有没有
    const city = JSON.parse(localStorage.getItem(CURRENT_CITY))
    if (city) {
      resolve(city)
      callback && callback(city)
    } else {
      // 方法2： 通过百度地图的定位去获取当前城市
      const myCity = new window.BMap.LocalCity()
      myCity.get((result) => {
        axios
          .get(`http://localhost:8080/area/info?name=${result.name}`)
          .then((res) => {
            // 把城市信息存起来
            const { body } = res.data
            localStorage.setItem(CURRENT_CITY, JSON.stringify(body))
            resolve(body)
            callback && callback(body)
          })
          .catch((err) => {
            reject(err)
            callback && callback(err)
          })
      })
    }
  })
}
