/* eslint-disable react/prop-types */
import axios from "axios";
import { DndContext, type DragEndEvent, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { getAuthAxios } from "../lib/api/apiClient";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getPosterIDInDB } from "../lib/posters/utils";


const CustomDrag = (props) => {
  const [posterID, setPosterID] = useState(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const router = useRouter();
  useEffect(() => {
    async function getData() {
      const posterType = router.query.posterType;
      const _routeID = router.query.routeID;
      const id = await getPosterIDInDB(posterType, _routeID);
      setPosterID(id);
      const res = await axios.get(`/api/poster/${id}`);
      if (res.data[`element_${props.id}`]) {
        const pos = res.data[`element_${props.id}`];
        setX(pos.x);
        setY(pos.y);
      }
    }
    getData();
  }, [router.query, props.id]);
  
  const customDraggableSaveData = (
    elementID: string,
    x: number,
    y: number
  ) => {
    const params = {
      posterID: posterID,
    };
    params[`element_${elementID}`] = {
      x, y
    };
    getAuthAxios().put(`/api/poster/${posterID}`, params);
  };

  const DraggableContent = ({ children }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: props.id,
      disabled: !props.isDraggable,
    });

    const style: React.CSSProperties = {
      position: "absolute",
      left: x,
      top: y,
      transform: transform ? CSS.Translate.toString(transform) : undefined,
    };

    const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (
      event
    ) => {
      if (props.cancel && event.target instanceof Element) {
        if (
          event.target.matches(props.cancel) ||
          event.target.closest(props.cancel)
        ) {
          return;
        }
      }
      if (listeners.onPointerDown) {
        listeners.onPointerDown(event);
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onPointerDown={handlePointerDown}
      >
        {children}
      </div>
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!props.isDraggable) return;
    const { delta } = event;
    if (!delta) return;
    const newX = x + delta.x;
    const newY = y + delta.y;
    setX(newX);
    setY(newY);
    customDraggableSaveData(props.id, newX, newY);
  };

  if (!props.isDraggable) {
    return <>{props.children}</>;
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DraggableContent>{props.children}</DraggableContent>
    </DndContext>
  );
};

export default CustomDrag;