/*
 * @Date: 2024-01-13 18:29:00
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-19 20:22:28
 */
import React, { useState } from '/core/React.js'

function Count() {
  const [num, setNum] = useState(1)
  const [bar, setBar] = useState('')
  function handle() {
    setNum(num + 1);
    setBar(bar + '1')
  }
  return <div>count: {num}{bar} <button onClick={handle}>+</button></div>
}

const App = () => <div id="app">
  <Count></Count>
</div>;
// const App = React.createElement('div', { id: 'app' }, 'mini')

export default App
