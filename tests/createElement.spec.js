/*
 * @Date: 2024-01-13 20:10:15
 * @Author: 枫
 * @LastEditors: 枫
 * @description: createElement 函数单元测试
 * @LastEditTime: 2024-01-13 20:35:28
 */
import { describe, it, expect } from "vitest";
import React from "/core/React";

describe('createElement.spec', () => {
  it('生成一个VDOM对象', () => {
    const el = React.createElement('div', {}, 'mini-react')
    expect(el).toEqual({
      type: 'div',
      props: {
        children: [{
          type: 'TEXT_ELEMENT',
          props: {
            nodeValue: 'mini-react',
            children: []
          }
        }]
      },
    })
  })

  it('props 挂载', () => {
    const el = React.createElement('div', { id: 'app' }, 'mini-react')
    expect(el.props.id).toEqual('app')
  })
})
