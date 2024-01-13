/*
 * @Date: 2024-01-13 13:25:01
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-13 16:12:27
 */
import React from './React.js'

const ReactDOM = {
  createRoot(container) {
    return {
      render(App) {
        React.render(App, container)
      }
    }
  }
}

export default ReactDOM;