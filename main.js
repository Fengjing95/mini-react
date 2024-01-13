/*
 * @Date: 2024-01-13 12:09:51
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-13 16:10:14
 */
import ReactDOM from './core/ReactDOM.js'
import React from './core/React.js'

const App = React.createElement('div', { id: 'app' }, 'mini-', 'react');

ReactDOM.createRoot(document.querySelector('#root')).render(App);
