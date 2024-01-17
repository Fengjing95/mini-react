/*
 * @Date: 2024-01-13 18:29:00
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-17 22:47:14
 */
import React from '/core/React.js'

function Container() {
  return <div>
    <Count num={count}></Count>
    {/* <Count num={20}></Count> */}
  </div>
}

let count = 10
function Count({ num }) {
  function handle() {
    console.log('click')
    count++
    React.update()
  }
  return <div>count: {count} <button onClick={handle}>+</button></div>
}

const App = () => <div id="app">
  mini-react
  <br />
  <Count></Count>
  <Container></Container>

</div>;
// const App = React.createElement('div', { id: 'app' }, 'mini')

export default App
