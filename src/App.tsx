import React from "react";
import SnackbarManager from "./components/SnackbarManager";
import { StyledPaper } from "../src/styles/StyledComponents";
import { ItemsTable } from "./components/ItemsTable/ItemsTable";

const App: React.FC = () => {
  return (
    <StyledPaper>
      <ItemsTable />
    </StyledPaper>
  );
};

export default App;
