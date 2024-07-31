import { useRef } from "react";
import { LOCAL_CONSTANTS } from "../../../constants";
import { calcPath } from "../utils/calcPath";
import {
  useTableSchemaEditorActions,
  useTableSchemaEditorState,
} from "../../../contexts/tableSchemaEditorContext";

export const Relationship = ({ data }) => {
  const { selectedElement, tables } = useTableSchemaEditorState();
  const { setSelectedElement } = useTableSchemaEditorActions();
  const pathRef = useRef();

  let cardinalityStart = "1";
  let cardinalityEnd = "1";

  switch (data.cardinality) {
    case LOCAL_CONSTANTS.POSTGRE_SQL_CARDINALITY.MANY_TO_ONE:
      cardinalityStart = "n";
      cardinalityEnd = "1";
      break;
    case LOCAL_CONSTANTS.POSTGRE_SQL_CARDINALITY.ONE_TO_MANY:
      cardinalityStart = "1";
      cardinalityEnd = "n";
      break;
    case LOCAL_CONSTANTS.POSTGRE_SQL_CARDINALITY.ONE_TO_ONE:
      cardinalityStart = "1";
      cardinalityEnd = "1";
      break;
    default:
      break;
  }

  let cardinalityStartX = 0;
  let cardinalityEndX = 0;
  let cardinalityStartY = 0;
  let cardinalityEndY = 0;

  const cardinalityOffset = 28;

  if (pathRef.current) {
    const pathLength = pathRef.current.getTotalLength();
    const point1 = pathRef.current.getPointAtLength(cardinalityOffset);
    cardinalityStartX = point1.x;
    cardinalityStartY = point1.y;
    const point2 = pathRef.current.getPointAtLength(
      pathLength - cardinalityOffset
    );
    cardinalityEndX = point2.x;
    cardinalityEndY = point2.y;
  }

  const edit = () => {
    setSelectedElement((prev) => ({
      ...prev,
      currentTab: LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.RELATIONSHIPS,
      element: LOCAL_CONSTANTS.TABLE_EDITOR_OBJECT_TYPES.RELATIONSHIP,
      id: data.id,
      open: true,
    }));
    if (
      selectedElement.currentTab !==
      LOCAL_CONSTANTS.TABLE_EDITOR_ACTIONS.RELATIONSHIPS
    )
      return;
    document
      .getElementById(`scroll_ref_${data.id}`)
      .scrollIntoView({ behavior: "smooth" });
  };

  return (
    <g className="select-none group" onDoubleClick={edit}>
      <path
        ref={pathRef}
        d={calcPath(
          {
            ...data,
            startTable: {
              x: tables[data.startTableId].x,
              y: tables[data.startTableId].y,
            },
            endTable: {
              x: tables[data.endTableId].x,
              y: tables[data.endTableId].y,
            },
          },
          LOCAL_CONSTANTS.TABLE_EDITOR_TABLE_WIDTH
        )}
        stroke="gray"
        className="group-hover:stroke-sky-700"
        fill="none"
        strokeWidth={2}
        cursor="pointer"
      />
      {pathRef.current && true && (
        <>
          <circle
            cx={cardinalityStartX}
            cy={cardinalityStartY}
            r="12"
            fill="grey"
            className="group-hover:fill-sky-700"
          />
          <text
            x={cardinalityStartX}
            y={cardinalityStartY}
            fill="white"
            strokeWidth="0.5"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {cardinalityStart}
          </text>
          <circle
            cx={cardinalityEndX}
            cy={cardinalityEndY}
            r="12"
            fill="grey"
            className="group-hover:fill-sky-700"
          />
          <text
            x={cardinalityEndX}
            y={cardinalityEndY}
            fill="white"
            strokeWidth="0.5"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {cardinalityEnd}
          </text>
        </>
      )}
    </g>
  );
};
