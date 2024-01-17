/*
 * @Date: 2024-01-13 18:29:00
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-17 20:34:00
 */
import React from '/core/React.js'

function Container() {
  return <div>
    <Count num={10}></Count>
    {/* <Count num={20}></Count> */}
  </div>
}

function Count({ num }) {
  function handle() {
    console.log('click')
  }
  return <div>count: {num} <button onClick={handle}>+</button></div>
}

const App = () => <div id="app">
  mini-react
  <br />
  <Container></Container>

</div>;
// const App = React.createElement('div', { id: 'app' }, 'mini')

export default App
