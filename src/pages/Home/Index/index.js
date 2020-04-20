import React from 'react'
import axios from 'axios'
import { Carousel, Flex, Grid } from 'antd-mobile'
import { Link } from 'react-router-dom'
import { getCurrentCity } from 'utils/city'
import './index.scss'
import nav1 from 'assets/images/nav-1.png'
import nav2 from 'assets/images/nav-2.png'
import nav3 from 'assets/images/nav-3.png'
import nav4 from 'assets/images/nav-4.png'

// 提供导航数据
const navList = [
  { title: '整租', img: nav1, path: '/home/house' },
  { title: '合租', img: nav2, path: '/home/house' },
  { title: '地图找房', img: nav3, path: '/map' },
  { title: '去出租', img: nav4, path: '/rent' },
]

class Index extends React.Component {
  state = {
    swiperList: [],
    imgHeight: (212 / 375) * window.innerWidth,
    groupList: [],
    newsList: [],
    // 当前城市的信息
    city: {
      label: '北京',
      value: '',
    },
  }
  async componentDidMount() {
    this.getSwipers()
    const city = await getCurrentCity()
    this.setState(
      {
        city: city,
      },
      () => {
        // 等获取到了城市的id，才获取小组信息和资讯
        this.getGroups()
        this.getNews()
      }
    )
  }

  async getSwipers() {
    const res = await axios.get('http://localhost:8080/home/swiper')
    const { status, body } = res.data
    if (status === 200) {
      this.setState({
        swiperList: body,
      })
    }
  }
  async getGroups() {
    const res = await axios.get('http://localhost:8080/home/groups', {
      params: {
        area: this.state.city.value,
      },
    })
    const { status, body } = res.data
    if (status === 200) {
      this.setState({
        groupList: body,
      })
    }
  }
  async getNews() {
    const res = await axios.get('http://localhost:8080/home/news', {
      params: {
        area: this.state.city.value,
      },
    })
    const { status, body } = res.data
    if (status === 200) {
      this.setState({
        newsList: body,
      })
    }
  }
  //渲染轮播图
  renderSwiper() {
    if (this.state.swiperList.length === 0) {
      return null
    }
    return (
      <Carousel autoplay infinite>
        {this.state.swiperList.map((item) => (
          <a
            key={item.id}
            href="http://www.alipay.com"
            style={{
              display: 'inline-block',
              width: '100%',
              height: this.state.imgHeight,
            }}
          >
            <img
              src={`http://localhost:8080${item.imgSrc}`}
              alt=""
              style={{ width: '100%', verticalAlign: 'top' }}
              onLoad={() => {
                // fire window resize event to change height
                window.dispatchEvent(new Event('resize'))
                this.setState({ imgHeight: 'auto' })
              }}
            />
          </a>
        ))}
      </Carousel>
    )
  }
  // 渲染搜索框
  renderSearch() {
    return (
      <Flex className="search-box">
        <Flex className="search-form">
          <div
            className="location"
            onClick={() => this.props.history.push('/city')}
          >
            <span className="name">{this.state.city.label}</span>
            <span className="iconfont icon-arrow"> </span>
          </div>
          <div className="search-input">
            <span className="iconfont icon-seach" />
            <span className="text">请输入小区地址</span>
          </div>
        </Flex>
        {/* 地图小图标 */}
        <span className="iconfont icon-map"></span>
      </Flex>
    )
  }
  // 渲染导航
  renderNav() {
    return (
      <Flex>
        {navList.map((item) => (
          <Flex.Item key={item.title}>
            <Link to={item.path}>
              <img src={item.img} alt="" />
              <p>{item.title}</p>
            </Link>
          </Flex.Item>
        ))}
      </Flex>
    )
  }
  // 渲染租房小组
  renderGroup() {
    return (
      <>
        {/* 标题 */}
        <h3 className="group-title">
          租房小组
          <span className="more">更多</span>
        </h3>
        {/* 内容 */}
        <div className="group-content">
          <Grid
            data={this.state.groupList}
            columnNum={2}
            square={false}
            hasLine={false}
            renderItem={(el) => (
              <Flex className="group-item" justify="around">
                <div className="desc">
                  <p className="title">{el.title}</p>
                  <span className="info">{el.desc}</span>
                </div>
                <img src={`http://localhost:8080${el.imgSrc}`} alt="" />
              </Flex>
            )}
          />
        </div>
      </>
    )
  }
  // 渲染最新资讯
  renderNews() {
    return (
      <>
        <h3 className="news-title">最新资讯</h3>
        {this.state.newsList.map((item) => (
          <div className="news-item" key={item.id}>
            <div className="imgwrap">
              <img
                className="img"
                src={`http://localhost:8080${item.imgSrc}`}
                alt=""
              />
            </div>
            <Flex className="content" direction="column" justify="between">
              <h3 className="title">{item.title}</h3>
              <Flex className="info" justify="between">
                <span>{item.from}</span>
                <span>{item.date}</span>
              </Flex>
            </Flex>
          </div>
        ))}
      </>
    )
  }
  // 组件渲染
  render() {
    return (
      <div className="index">
        <div className="carousel" style={{ hegiht: this.state.imgHeight }}>
          {/* 轮播图 */}
          {this.renderSearch()}
          {this.renderSwiper()}
        </div>
        {/* 导航模块 */}
        <div className="nav">{this.renderNav()}</div>
        {/* 租房小组 */}
        <div className="group">{this.renderGroup()}</div>
        {/* 最新资讯 */}
        <div className="news">{this.renderNews()}</div>
      </div>
    )
  }
}

export default Index
