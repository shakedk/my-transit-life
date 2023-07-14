/* eslint-disable react/prop-types */
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { getPosterIDInDB } from "../../pages/posters/utils";


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
  }, [router.query]);
  
  const customDraggbleSaveData = (
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
    axios.put(`/api/poster/${posterID}`, params);
  };

const handleStop = (event, dragElement) => {
    setX(dragElement.x)
    setY(dragElement.y)
    customDraggbleSaveData(props.id, dragElement.x, dragElement.y)
  };

return (
       <Draggable
        disabled={!props.isDrggable}
        onStop={handleStop} 
        position={{x: x, y:y}}
        onMouseDown={props.onMouseDown}
        cancel={props.cancel}
       > 
       
       {props.children}
       </Draggable>
      )
}

export default CustomDrag;