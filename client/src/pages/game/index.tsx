import { faHome, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { NavLink } from "src/components/atoms/link";
import { useGame } from "src/hooks/useGame";
import { SessionContent } from "src/components/organizms/session-view";
import { SessionStageType } from "src/models/session.model";

export const GamePage = () => {
  const { tag } = useParams();
  const { loading, data, error, patch } = useGame({ tag, preload: true });
  const [sourceData] = userBroadcast({ id: data?.id, start: data?.stage !== SessionStageType.Close });

  useEffect(() => {
    if (sourceData) {
      patch(sourceData);
      console.log('patch', sourceData);
    }
  }, [sourceData, patch]);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <h1 className="flex items-center gap-2 uppercase text-xl">
          <span>Loading</span>
          <FontAwesomeIcon icon={faSync} className="animate-spin" />
        </h1>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col p-6 gap-2 justify-center text-center">
        <h1 className="uppercase text-xl font-thin">Game not found</h1>
        <p className="flex justify-center">
          <NavLink to="/" className="flex gap-2 items-center capitalize border-b border-black">
            <span>go home</span>
            <FontAwesomeIcon icon={faHome} />
          </NavLink>
        </p>
      </div>
    );
  }

  const { title, details } = data;

  return (
    <article className="flex flex-col gap-6 p-6">
      <section className="text-center">
        <h1 className="text-2xl">{title}</h1>
        {details ? <h3 className="text-md font-thin">{details}</h3> : null}
      </section>
      <SessionContent data={data} />
    </article>
  );
};

function userBroadcast({ id, start = false }) {
  const ref = useRef(null);
  const [state, setState] = useState();

  useEffect(() => {
    if (!id || !start){
      return;
    }

    if (ref.current) {
      ref.current.close();
    }

    const source = new EventSource(`/api/games/${id}/broadcast`, {
      withCredentials: true,
    });
  
    source.onmessage = (message) => {
      const messageData = JSON.parse(message.data);
  
      setState(messageData);
    };
  
    source.onerror = (error) => {
      console.log("stream error");
    };

    ref.current = source;

    return () => {
      source.close();
    };
  }, [id, start])

  return [state];
}

// let stream;
// function subscribeToUserBroadcast({ id }) {
//   if (stream) {
//     stream.close();
//   }

//   stream = new EventSource(`/api/games/${id}/broadcast`, {
//     withCredentials: true,
//   });

//   stream.onmessage = (message) => {
//     const messageData = JSON.parse(message.data);

//     console.log(messageData);
//   };

//   stream.onerror = (error) => {
//     console.log("stream error");
//   };
// }
