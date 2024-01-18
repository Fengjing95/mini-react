/*
 * @Date: 2024-01-13 18:29:00
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-18 22:36:36
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
  const update = React.update()
  function handle() {
    console.log('click')
    count++
    update()
  }
  return <div>count: {count} <button onClick={handle}>+</button></div>
}
let hidden = true
function Hide() {
  const foo = <div>
    foo
    <div>child</div>
    <div>child2</div>
  </div>
  const bar = <div>bar</div>

  const update = React.update()
  function handle() {
    hidden = !hidden
    update()
  }

  return <div>
    {hidden && bar}
    <button onClick={handle}>hide</button>
    {/* <div>{hidden ? foo : bar}</div> */}
  </div>
}

const App = () => <div id="app">
  {/* mini-react
  <br />
  <Container></Container> */}
  <Hide></Hide>
  <Count></Count>

</div>;
// const App = React.createElement('div', { id: 'app' }, 'mini')

export default App
