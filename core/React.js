/*
 * @Date: 2024-01-13 13:24:49
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-15 23:08:18
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
        const isTextNode = ['string', 'number'].includes(typeof child);
        return isTextNode
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
  root = nextWorkOfUnit
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
    commitRoot(root);
  }
  requestIdleCallback(workloop);
}

function commitRoot(root) {
  commitWork(root.child)
  root = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  // 函数组件嵌套
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
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

function initChildren(work, children) {
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
  // 判断是否为函数组件
  const isFunctionComponent = typeof fiber.type === 'function';
  if (!isFunctionComponent) {
    if (!fiber.dom) {
      // 创建DOM
      const dom = (fiber.dom = createDOM(fiber.type));

      // fiber.parent.dom.append(dom)

      // 处理props
      updateProps(dom, fiber.props);
    }
  }

  // 转换链表
  const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children;
  initChildren(fiber, children)

  // 返回下一个处理的节点
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent;
  }
  // return fiber.parent?.sibling
}

const React = {
  createElement,
  render,
}

export default React
