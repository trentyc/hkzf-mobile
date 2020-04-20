import React from 'react'
import axios from 'axios'
import { NavBar, Icon, Toast } from 'antd-mobile'
import { getCurrentCity, setCity } from 'utils/city'
import { AutoSizer, List } from 'react-virtualized'
import './index.scss'

const TITLE_HEIGHT = 36
const CITY_HEIGHT = 50
const HOT = ['北京', '上海', '广州', '深圳']

class City extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cityObj: {},
      cityArr: [],
      // 当前高亮下标
      currentIndex: 0,
    }
    // 指定城市列表ref
    this.listRef = React.createRef()
  }
  componentDidMount() {
    this.getCityList()
  }
  //获取城市列表数据
  async getCityList() {
    const res = await axios.get('http://localhost:8080/area/city?level=1')
    const { status, body } = res.data
    if (status === 200) {
      const { cityObj, cityArr } = this.parseCityList(body)
      // console.log(cityObj)
      // console.log(cityArr)
      // 处理热门城市数据
      const result = await axios.get('http://localhost:8080/area/hot')
      cityArr.unshift('hot')
      cityObj.hot = result.data.body

      // 处理当前定位城市
      cityArr.unshift('#')
      const city = await getCurrentCity()
      // console.log(city)
      cityObj['#'] = [city]
      // 存入数据
      this.setState(
        {
          cityObj,
          cityArr,
        },
        () => {
          // 等数据计算完成后再提前测量全部行的高
          this.listRef.current.measureAllRows()
        }
      )
    }
  }

  // 处理城市数据
  parseCityList(body) {
    const cityObj = {}
    body.forEach((item) => {
      const short = item.short.slice(0, 1)
      if (short in cityObj) {
        cityObj[short].push(item)
      } else {
        cityObj[short] = [item]
      }
    })
    const cityArr = Object.keys(cityObj).sort()
    return {
      cityObj,
      cityArr,
    }
  }
  // 处理列表标题
  parseTitle(title) {
    if (title === '#') {
      return '当前定位'
    } else if (title === 'hot') {
      return '热门城市'
    } else {
      return title.toUpperCase()
    }
  }
  selectCity(city) {
    if (HOT.includes(city.label)) {
      setCity(city)
      this.props.history.go(-1)
    } else {
      // 点击提示没有房源
      Toast.info('该城市没有更多的房源信息', 1)
    }
  }
  // 列表内容
  rowRenderer({ key, index, style }) {
    const short = this.state.cityArr[index]
    const citys = this.state.cityObj[short]
    return (
      <div key={key} style={style} className="city-item">
        <div className="title">{this.parseTitle(short)}</div>
        {citys.map((item) => (
          <div
            key={item.value}
            className="name"
            onClick={this.selectCity.bind(this, item)}
          >
            {item.label}
          </div>
        ))}
      </div>
    )
  }
  // 动态计算每一行的高度
  caclHeight({ index }) {
    const title = this.state.cityArr[index]
    const arr = this.state.cityObj[title]
    return TITLE_HEIGHT + arr.length * CITY_HEIGHT
  }
  // 当List长列表的行发生改变的时候会触发
  onRowsRendered({ startIndex }) {
    // 城市列表栏滑动，让右侧索引对应高亮
    if (this.state.currentIndex !== startIndex) {
      this.setState({
        currentIndex: startIndex,
      })
    }
  }
  handleClick(index) {
    this.listRef.current.scrollToRow(index)
  }
  render() {
    return (
      <div className="city">
        {/* 导航条 */}
        <NavBar
          mode="dark"
          icon={<Icon type="left" />}
          onLeftClick={() => this.props.history.go(-1)}
        >
          城市选择
        </NavBar>
        {/* 城市列表*/}
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width}
              height={height}
              rowCount={this.state.cityArr.length}
              rowHeight={this.caclHeight.bind(this)}
              rowRenderer={this.rowRenderer.bind(this)}
              onRowsRendered={this.onRowsRendered.bind(this)}
              ref={this.listRef}
              scrollToAlignment="start"
            />
          )}
        </AutoSizer>
        {/* 右侧快捷导航 */}
        <ul className="city-index">
          {this.state.cityArr.map((item, index) => (
            <li className="city-index-item" key={item}>
              <span
                className={
                  index === this.state.currentIndex ? 'index-active' : ''
                }
                onClick={this.handleClick.bind(this, index)}
              >
                {item === 'hot' ? '热' : item.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
export default City
