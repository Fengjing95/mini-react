/*
 * @Date: 2024-01-13 18:29:00
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-15 23:02:38
 */
import React from '/core/React.js'

function Container() {
  return <div>
    <Count num={10}></Count>
    <Count num={20}></Count>
  </div>
}

function Count({ num }) {
  return <div>count: {num}</div>
}

const App = () => <div id="app">
  mini-react
  <br />
  <Container></Container>

</div>;
// const App = React.createElement('div', { id: 'app' }, 'mini')

export default App
