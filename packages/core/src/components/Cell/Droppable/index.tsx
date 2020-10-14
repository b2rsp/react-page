import classNames from 'classnames';
import * as React from 'react';
import { useDrop } from 'react-dnd';
import { CellDrag } from '../../../types/editable';
import {
  useCellPlugin,
  useDropActions,
  useHoverActions,
  useIsInsertMode,
  useIsLayoutMode,
  useNode,
  useNodeWithAncestors,
  useOptions,
  usePlugins,
} from '../../hooks';
import { onDrop, onHover } from './helper/dnd';

export const useCellDrop = (nodeId: string) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const nodeWithAncestor = useNodeWithAncestors(nodeId);
  const options = useOptions();
  const hoverActions = useHoverActions();
  const dropActions = useDropActions();
  const [, dropRef] = useDrop<CellDrag, void, void>({
    accept: 'cell',
    canDrop: (item) => {
      return (
        item.cell.id !== nodeWithAncestor.node.id &&
        !nodeWithAncestor.ancestors.some((a) => a.id === item.cell.id)
      );
    },
    hover(item, monitor) {
      onHover(nodeWithAncestor, monitor, ref.current, hoverActions, options);
    },
    drop: (item, monitor) => {
      onDrop(nodeWithAncestor, monitor, ref.current, dropActions, options);
    },
  });
  // see https://github.com/react-dnd/react-dnd/issues/1955
  const attach = React.useCallback(
    (domElement: HTMLDivElement) => {
      dropRef(domElement);
      ref.current = domElement;
      // use dom element here for measuring
    },
    [dropRef]
  );
  return attach;
};
const Droppable: React.FC<{ nodeId: string; isLeaf?: boolean }> = (props) => {
  const isLayoutMode = useIsLayoutMode();
  const isInsertMode = useIsInsertMode();
  const attach = useCellDrop(props.nodeId);
  const node = useNode(props.nodeId);
  const options = useOptions();
  if (!(isLayoutMode || isInsertMode) && !options.allowMoveInEditMode) {
    return (
      <div className={'ory-cell-droppable-container'}>{props.children}</div>
    );
  }

  return (
    <div
      ref={attach}
      className={classNames('ory-cell-droppable', {
        'ory-cell-droppable-is-over-current': node.hoverPosition,
        [`ory-cell-droppable-is-over-${node.hoverPosition}`]: node.hoverPosition,
        'ory-cell-droppable-leaf': props.isLeaf,
      })}
    >
      {props.children}
    </div>
  );
};

export default Droppable;
