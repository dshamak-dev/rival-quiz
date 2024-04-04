import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Button } from "src/components/atoms/button";

export const SearchInput = ({ onSubmit = null, ...props }: any) => {
  const { placeholder = "Search input" } = props;

  const handleSubmit = (ev: any) => {
    ev.preventDefault();

    if (onSubmit && onSubmit instanceof Function) {
      onSubmit(ev);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-[1fr_auto] justify-between items-center">
        <input type="search" className="grow-1" placeholder={placeholder} />
        <Button className="h-full px-3 border-0" primary>
          <FontAwesomeIcon icon={faSearch} />
        </Button>
      </div>
    </form>
  );
};