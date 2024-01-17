/*
 * @Date: 2024-01-13 20:10:15
 * @Author: 枫
 * @LastEditors: 枫
 * @description: createElement 函数单元测试
 * @LastEditTime: 2024-01-17 21:38:50
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import React from "/core/React";

function handle() {
  console.log('click')
}

describe('createElement.spec', () => {
  let el;
  beforeAll(() => {
    el = React.createElement('button', { id: 'app', onClick: handle }, 'mini-react')
  })

  it('生成一个VDOM对象', () => {
    expect(el).toEqual({
      type: 'button',
      props: {
        id: 'app',
        onClick: handle,
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
    expect(el.props.id).toEqual('app')
  })

  // it('事件绑定', () => {
  //   const fiber = React.render(el)
  //   console.log(fiber);
  //   const func = vi.fn(() => { console.log('click') })
  //   expect(func).toHaveBeenCalledTimes(1)
  // })
})
