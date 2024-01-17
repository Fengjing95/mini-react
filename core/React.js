/*
 * @Date: 2024-01-13 13:24:49
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-17 22:49:13
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
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
  }
  nextWorkOfUnit = wipRoot
  requestIdleCallback(workLoop)
}

let wipRoot = null;
let nextWorkOfUnit = null;
let currentRoot = null;
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(wipRoot.child)
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  // 函数组件嵌套
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.effectTag === 'update') {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
  } else if (fiber.effectTag === 'placement') {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function createDOM(type) {
  return type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type)
}

function updateProps(dom, nextProps, prevProps) {
  // 删除
  Object.keys(prevProps).forEach(key => {
    if (key !== 'children') {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  })
  // 添加/更新
  Object.keys(nextProps).forEach(key => {
    if (key !== 'children') {
      if (nextProps[key] !== prevProps[key] && dom) {
        if (key.startsWith('on')) {
          const eventName = key.slice(2).toLowerCase();
          dom.removeEventListener(eventName, prevProps[key]);
          dom.addEventListener(eventName, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  });
}

function reconcileChildren(work, children) {
  let oldFiber = work.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;
    let fiber;

    if (isSameType) {
      fiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: work,
        sibling: null,
        dom: oldFiber.dom,
        effectTag: 'update',
        alternate: oldFiber
      }
    } else {
      fiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: work,
        sibling: null,
        dom: null,
        effectTag: 'placement',
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
    if (index === 0) {
      work.child = fiber;
    } else {
      prevChild.sibling = fiber;
    }
    prevChild = fiber;
  })
}

// 处理函数组件
function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

// 处理普通元素
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    // 创建DOM
    const dom = (fiber.dom = createDOM(fiber.type));

    // 处理props
    updateProps(dom, fiber.props, {});
  }
  // 转换链表
  const children = fiber.props.children;
  reconcileChildren(fiber, children)
}

function performWorkOfUnit(fiber) {
  // 判断是否为函数组件
  const isFunctionComponent = typeof fiber.type === 'function';
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

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
}

function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  }
  nextWorkOfUnit = wipRoot
}

const React = {
  createElement,
  render,
  update,
}

export default React
