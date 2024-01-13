/*
 * @Date: 2024-01-13 13:24:49
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-13 20:05:02
 */
/**
 * 创建文本内容
 * @param {string} text 文本内容
 */
function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

/**
* 创建元素
* @param {string} type 创建元素类型
* @param {object} props 创建元素时添加的属性
* @param  {...any} children 子元素
*/
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child === 'string'
          ? createTextNode(child)
          : child
      }),
    },
  };
}

/**
 * 渲染vdom
 * @param {object} el vdom
 * @param {HTMLElement} container 容器
 */
function render(el, container) {
  const dom = el.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(el.type);

  Object.keys(el.props).forEach(key => {
    if (key !== 'children') {
      dom[key] = el.props[key];
    }
  });

  const children = el.props.children;
  children.forEach(child => {
    React.render(child, dom);
  });

  container.appendChild(dom);
}

const React = {
  createElement,
  render,
}

export default React
