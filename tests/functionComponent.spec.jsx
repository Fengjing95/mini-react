/*
 * @Date: 2024-01-15 23:09:02
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-15 23:23:07
 */
import { describe, it, expect } from "vitest";
import React from "/core/React";

function Count({ num }) {
  return <div>Count: {num}</div>
}

function Container() {
  return <div>
    <Count num={1} />
    <Count num={2} />
    <Count num={3} />
  </div>
}

describe('functionComponent.spec', () => {
  it('函数组件渲染', () => {
    const el = <Count num={10}></Count>
    expect(typeof el.type).toEqual('function');
    const result = el.type(el.props);
    expect(result.type).toEqual('div')
    expect(result.props.children[0].props.nodeValue).toEqual('Count: ')
    expect(result.props.children[1].props.nodeValue).toEqual(10)
  })
  it('函数组件嵌套渲染', () => {
    const el = <Container></Container>
    expect(typeof el.type).toEqual('function');
    const result = el.type(el.props)
    expect(result.props.children.length).toEqual(3)
    const [count1, count2, count3] = result.props.children;
    console.log('[ el ] >', count1)
    expect(count1.props.num).toEqual(1)
    expect(count2.props.num).toEqual(2)
    expect(count3.props.num).toEqual(3)
  })
})
