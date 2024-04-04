import { faHome, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { NavLink } from "src/components/atoms/link";
import { useGame } from "src/hooks/useGame";
import { SessionContent } from "src/components/organizms/session-view";

export const GamePage = () => {
  const { tag } = useParams();
  const { loading, data, error } = useGame({ tag, preload: true });

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
