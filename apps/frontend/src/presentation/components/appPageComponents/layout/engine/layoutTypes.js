/**
 * @typedef {Object} LayoutNodeBase
 * @property {string} id - Unique identifier for the layout node
 * @property {'column' | 'row' | 'widget' | 'container' | 'stack' | 'z-stack'} type - Node type
 * @property {string} [condition] - Mustache expression. Node renders only when expression evaluates to truthy.
 * @property {{ collection: string, itemAlias: string, indexAlias?: string }} [repeat] - Iteration config.
 */

/**
 * @typedef {LayoutNodeBase & { type: 'column', children: LayoutNode[] }} ColumnNode
 */

/**
 * @typedef {LayoutNodeBase & { type: 'row', children: (WidgetNode | ContainerNode | StackNode)[], gap?: number }} RowNode
 */

/**
 * @typedef {LayoutNodeBase & { type: 'widget', widgetKey: string, span: number, sizing: 'auto' | 'fill' | 'fixed', minHeight?: number, maxHeight?: number, fixedHeight?: number }} WidgetNode
 */

/**
 * @typedef {LayoutNodeBase & { type: 'container', span: number, sizing: 'auto' | 'fill' | 'fixed', children: ColumnNode, style?: Object }} ContainerNode
 */

/**
 * @typedef {LayoutNodeBase & { type: 'stack', direction: 'horizontal' | 'vertical', span: number, sizing: 'auto' | 'fill' | 'fixed', wrap?: boolean, gap?: number, align?: string, children: (WidgetNode | ContainerNode)[] }} StackNode
 */

/**
 * @typedef {LayoutNodeBase & { type: 'z-stack', span: number, sizing: 'auto' | 'fill' | 'fixed', children: (WidgetNode | ContainerNode)[], style?: Object }} ZStackNode
 */

/**
 * @typedef {ColumnNode | RowNode | WidgetNode | ContainerNode | StackNode | ZStackNode} LayoutNode
 */
