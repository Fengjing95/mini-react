/*
 * @Date: 2024-01-13 13:24:49
 * @Author: 枫
 * @LastEditors: 枫
 * @description: description
 * @LastEditTime: 2024-01-20 16:18:11
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
let wipFiber = null;
let nextWorkOfUnit = null;
let deletions = [];
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = undefined
    }
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  deletions.forEach(commitDeletion)
  commitEffectHooks()
  commitWork(wipRoot.child)
  wipRoot = null;
  deletions = []
}

function commitEffectHooks() {
  function run(fiber) {
    if (!fiber) return;
    if (!fiber.alternate) {
      // init
      fiber.effectHooks?.forEach(hook => {
        hook.cleanup = hook.callback()
      })
    } else {
      // update
      fiber.effectHooks?.forEach((newHook, index) => {
        if (newHook.deps.length > 0) {
          const oldEffectHook = fiber.alternate?.effectHooks[index]
          const needUpdate = oldEffectHook?.deps.some((oldDep, i) => {
            return oldDep !== newHook.deps[i]
          })
          needUpdate && (newHook.cleanup = newHook.callback())
        }
      })
    }
    run(fiber.child)
    run(fiber.sibling)
  }

  function runCleanup(fiber) {
    if (!fiber) return

    fiber.alternate?.effectHooks?.forEach(hook => {
      if (hook.deps.length > 0) {
        hook.cleanup?.()
      }
    })

    runCleanup(fiber.child)
    runCleanup(fiber.sibling)
  }

  runCleanup(wipRoot)
  run(wipRoot)
}

function commitDeletion(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent;
    // 函数组件嵌套
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent;
    }
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child);
  }
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
  children.filter(child => child).forEach((child, index) => {
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
      // if (fiber) {
      fiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: work,
        sibling: null,
        dom: null,
        effectTag: 'placement',
      }
      // }

      if (oldFiber) {
        deletions.push(oldFiber)
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

    // if (fiber) {
    prevChild = fiber;
    // }
  })

  while (oldFiber) {
    deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

// 处理函数组件
function updateFunctionComponent(fiber) {
  stateHooks = []
  stateIndex = 0
  effectHooks = []

  wipFiber = fiber;
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
  let currentFiber = wipFiber
  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    }
    nextWorkOfUnit = wipRoot
  }

}

let stateHooks = [];
let stateIndex = 0;
export function useState(initial) {
  let currentFiber = wipFiber;
  let oldHook = currentFiber.alternate?.stateHooks[stateIndex++]
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : []
  }

  stateHook.queue.forEach(action => {
    stateHook.state = action(stateHook.state)
  })
  stateHook.queue = []

  stateHooks.push(stateHook)
  currentFiber.stateHooks = stateHooks

  function setState(action) {
    const eagerState = typeof action === 'function' ? action(stateHook.state) : action
    if (eagerState === stateHook.state) return
    // stateHook.state = action(stateHook.state)
    stateHook.queue.push(typeof action !== 'function' ? () => action : action)
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }
    nextWorkOfUnit = wipRoot
  }

  return [stateHook.state, setState]
}

let effectHooks = [];
export function useEffect(callback, deps) {
  const effectHook = {
    callback,
    deps
  }
  effectHooks.push(effectHook)
  wipFiber.effectHooks = effectHooks
}

const React = {
  createElement,
  render,
  useState,
  useEffect,
}

export default React
