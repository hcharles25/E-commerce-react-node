import React, { Fragment } from "react";
import { FormControl, Input, InputAdornment } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

interface ISearchBar {
  handleSearchValue: Function;
  searchValue: string;
}

const SearchBar = ({ handleSearchValue, searchValue }: ISearchBar) => {
  return (
    <Fragment>
      {/* <Typography>Search</Typography> */}
      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FormControl
          style={{
            width: "90%",
          }}
        >
          <Input
            id="search-input"
            placeholder="Search Your Product"
            endAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
          />
        </FormControl>
      </div>
    </Fragment>
  );
};
export default SearchBar;