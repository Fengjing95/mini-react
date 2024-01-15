/*
 * @Date: 2024-01-13 13:24:49
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-15 20:04:20
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
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }
  requestIdleCallback(workloop)
}

let nextWorkOfUnit = null;
let root = null;
function workloop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextWorkOfUnit && root) {
    commitRoot();
  }
  requestIdleCallback(workloop);
}

function commitRoot(root) {
  commitWork(root.child)
  root = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  fiber.parent.dom.append(fiber.dom);
  commitWork(fiber.child);
  commitRoot(fiber.sibling);
}

function createDOM(type) {
  return type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type)
}

function updateProps(dom, props) {
  Object.keys(props).forEach(key => {
    if (key !== 'children') {
      dom[key] = props[key];
    }
  });
}

function initChildren(work) {
  const children = work.props.children;
  let prevChild = null;
  children.forEach((child, index) => {
    const fiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: work,
      sibling: null,
      dom: null
    }
    if (index === 0) {
      work.child = fiber;
    } else {
      prevChild.sibling = fiber;
    }
    prevChild = fiber;
  })
}

function performWorkOfUnit(fiber) {
  if (!fiber.dom) {
    // 创建DOM
    const dom = (fiber.dom = createDOM(fiber.type));
    fiber.parent.dom.append(dom)

    // 处理props
    updateProps(dom, fiber.props);
  }

  // 转换链表
  initChildren(fiber)

  // 返回下一个处理的节点
  if (fiber.child) {
    return fiber.child
  }
  if (fiber.sibling) {
    return fiber.sibling
  }
  return fiber.parent?.sibling
}

const React = {
  createElement,
  render,
}

export default React
