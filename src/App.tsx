import React, { FC, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CellProps, Column, useTable, TableOptions } from "react-table";
import { debounce } from "lodash";

import styled from "styled-components";
import {
  TextField,
  IconButton,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Save } from "@mui/icons-material";

// Type definition for an item in the table
type Item = {
  id?: string;
  name: string;
  category: string;
  price: number;
  isNew?: boolean;
};

// Custom properties for editable cells within the table
interface EditableCellProps extends CellProps<Item, any> {
  updateMyData: (rowIndex: number, columnId: string, value: any) => void;
  itemId: string;
}

// Custom table options that extend the default React-Table configuration
interface CustomTableOptions extends TableOptions<Item> {
  updateMyData: (rowIndex: number, columnId: string, value: any) => void;
}

// Styled components using styled-components library
const StyledPaper = styled(Paper)`
  width: 100%;
  overflow: hidden;
`;

const StyledIconButton = styled(IconButton)`
  margin: 10px;
`;

const Table = styled(MuiTable)`
  margin: 10px;
`;

// Editable cell component to handle input changes and debounce saving data
const EditableCell: FC<EditableCellProps> = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData,
}) => {
  const [value, setValue] = useState(initialValue.toString());

  // useMemo hook to create a debounced function that updates data only after a specified delay
  const debouncedSave = useMemo(
    () => debounce((newValue: any) => updateMyData(index, id, newValue), 200),
    [updateMyData, index, id]
  );

  // Cleanup for the debounced function
  useEffect(() => {
    debouncedSave.cancel();
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  // onChange event handler for input fields
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (id === "price") {
      newValue = newValue.replace(/[^0-9.]/g, "");
      debouncedSave(newValue === "" ? 0 : parseFloat(newValue));
    } else {
      debouncedSave(newValue);
    }
    setValue(newValue);
  };

  // Ensure the local state reflects the initial or updated value
  // useEffect(() => {
  //   setValue(initialValue.toString());
  // }, [initialValue]);

  return (
    <TextField
      type={id === "price" ? "number" : "text"}
      value={value}
      onChange={onChange}
      fullWidth
      InputProps={{
        inputProps: {
          min: 0,
        },
      }}
    />
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning"
  >("success");

  // Function to close the snackbar
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // Function to display the snackbar with a specific message and severity
  const handleSnackbar = (
    message: string,
    severity: "success" | "error" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Column configuration for react-table
  const columns: Column<Item>[] = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        Cell: ({ value }) => <span>{value}</span>,
      },
      { Header: "Name", accessor: "name" },
      { Header: "Category", accessor: "category" },
      { Header: "Price", accessor: "price" },
    ],
    []
  );

  // React-table hook to initialize table properties and methods
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable<Item>({
      columns,
      data,
      defaultColumn: {
        Cell: EditableCell as React.ComponentType<CellProps<Item, any>>,
      },
      updateMyData: (rowIndex: number, columnId: string, value: any) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    } as CustomTableOptions);

  // Fetch initial data from a server on component mount
  useEffect(() => {
    axios.get("http://localhost:3000/items").then((res) => {
      setData(res.data);
    });
  }, []);

  // Function to handle adding a new row
  const addRow = () => {
    const newItem: Item = {
      name: "",
      category: "",
      price: 0,
      isNew: true,
    };
    setData((prev) => {
      return [...prev, { ...newItem }];
    });
  };

  // Function to handle deleting a row
  const deleteRow = (rowId: string) => {
    axios
      .delete(`http://localhost:3000/items/${rowId}`)
      .then(() => {
        setData(data.filter((item) => item.id !== rowId));
        handleSnackbar("Row deleted successfully", "warning");
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        handleSnackbar("Failed to delete row", "error");
      });
  };

  // Function to handle updating a row
  const editRow = (rowIndex: number, itemId: string) => {
    const row = data[rowIndex];

    axios
      .put(`http://localhost:3000/items/${itemId}`, row)
      .then(() => {
        handleSnackbar("Row updated successfully", "success");
      })
      .catch((error) => {
        console.error("Error saving row:", error);
        handleSnackbar("Failed to update row", "error");
      });
    return;
  };

  //Function for saving a new row
  const saveRow = (newItem?: Item) => {
    axios
      .post(`http://localhost:3000/items`, newItem)
      .then((res) => {
        const newItemId = res.data.id;
        const { isNew, ...updatedItem } = newItem as Item; // Destructuring to omit isNew
        const updatedData = data.map((item) =>
          item === newItem ? { ...updatedItem, id: newItemId } : item
        );
        setData(updatedData);
        handleSnackbar("Row added successfully", "success");
      })
      .catch((error) => {
        console.error("Error adding new item:", error);
        handleSnackbar("Failed to add row", "error");
      });
    return;
  };

  return (
    <StyledPaper>
      <StyledIconButton aria-label="add" onClick={addRow}>
        <AddBoxIcon />
      </StyledIconButton>
      <Table {...getTableProps()} aria-label="simple table">
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableCell {...column.getHeaderProps()}>
                  {column.render("Header")}
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <TableCell {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      if (row.original.id) {
                        deleteRow(row.original.id);
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    aria-label="save"
                    onClick={() => {
                      if (row.original.isNew) {
                        saveRow(row.original);
                      } else {
                        if (row.original.id) {
                          editRow(row.index, row.original.id);
                        }
                      }
                    }}
                  >
                    <Save />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default App;
