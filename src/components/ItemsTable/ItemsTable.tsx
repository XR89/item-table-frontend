import React, { useEffect, useState } from "react";
import { useTable } from "react-table";
import EditableCell from "./EditableCell";
import {
  IconButton,
  MenuItem,
  Select,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { CustomTableOptions, Item } from "../../types/types";
import {
  StyledIconButton,
  Table as StyledTable,
} from "../../styles/StyledComponents";
import {
  addItem,
  deleteItem,
  fetchItems,
  updateItem,
} from "../../api/ItemsApi";
import { Save } from "@mui/icons-material";
import SnackbarManager from "../SnackbarManager";
import { itemTypes } from "../../constants/itemTypes";
import { v4 as uuidv4 } from "uuid";

export const ItemsTable: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [filteredData, setFilteredData] = useState<Item[]>([]);
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("All");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning"
  >("success");

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await fetchItems();
        setData(items);
        setFilteredData(items);
      } catch (error) {
        handleSnackbar("Failed to load data", "error");
      }
    };
    loadItems();
  }, []);

  useEffect(() => {
    const filterData = () => {
      if (itemTypeFilter === "All") {
        setFilteredData(data);
      } else {
        setFilteredData(
          data.filter((item) => item.category === itemTypeFilter)
        );
      }
    };
    filterData();
  }, [itemTypeFilter, data]);

  const handleSnackbar = (
    message: string,
    severity: "success" | "error" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const addRow = () => {
    const newItem: Item = {
      rowId: uuidv4(),
      name: "",
      category: itemTypeFilter !== "All" ? itemTypeFilter : "",
      price: 0,
      isNew: true,
    };
    setData((prev) => {
      return [...prev, { ...newItem }];
    });
  };

  const handleAddItem = async (newItem: Item) => {
    try {
      const addedItem = await addItem(newItem);
      setData((prev) => {
        return prev.map((item) =>
          item.isNew ? { ...item, ...addedItem, isNew: false } : item
        );
      });
      handleSnackbar("Item added successfully", "success");
    } catch (error) {
      handleSnackbar("Failed to add item", "error");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      handleSnackbar("Item deleted from database successfully", "warning");
    } catch (error) {
      handleSnackbar("Failed to delete item", "error");
    }
  };

  const handleDeleteRow = (rowId: string) => {
    // Update the main data array
    const newData = data.filter((item) => item.rowId !== rowId);
    setData(newData);

    // Update the filtered data array
    const newFilteredData = filteredData.filter((item) => item.rowId !== rowId);
    setFilteredData(newFilteredData);

    handleSnackbar("Item removed", "warning");
  };

  const handleUpdateItem = async (id: string, updatedProps: Item) => {
    console.log(updatedProps);
    try {
      const updatedItem = await updateItem(id, updatedProps);
      setData((prev) => {
        return prev.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item
        );
      });
      handleSnackbar("Item updated successfully", "success");
    } catch (error) {
      handleSnackbar("Failed to update item", "error");
    }
  };

  const columns = React.useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Name", accessor: "name", Cell: EditableCell },
      { Header: "Category", accessor: "category", Cell: EditableCell },
      { Header: "Price", accessor: "price", Cell: EditableCell },
    ],
    []
  );

  const updateItemData = (rowIndex: number, columnId: string, value: any) => {
    console.log(value);
    setData((prev) => {
      return prev.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, [columnId]: value };
        }
        return row;
      });
    });

    // Update filteredData as well

    setFilteredData((prev) => {
      return prev.map((row, index) => {
        if (row === data[rowIndex]) {
          // Find the exact row from filteredData that corresponds to the changed row in data
          return { ...row, [columnId]: value };
        }
        return row;
      });
    });
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable<Item>({
      columns,
      data: filteredData,
      updateItemData: updateItemData,
    } as CustomTableOptions);

  return (
    <TableContainer>
      <Select
        value={itemTypeFilter}
        onChange={(e) => setItemTypeFilter(e.target.value as string)}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
      >
        <MenuItem value="All">All</MenuItem>
        {/* Assuming itemTypes is available as an array, map through it */}
        {itemTypes.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
      <StyledIconButton aria-label="add" onClick={addRow}>
        <AddBoxIcon />
      </StyledIconButton>
      <StyledTable {...getTableProps()}>
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
              <TableRow {...row.getRowProps({ key: row.original.rowId })}>
                {row.cells.map((cell) => (
                  <TableCell {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton
                    aria-label="save"
                    onClick={() => {
                      if (row.original.isNew) {
                        handleAddItem(row.original);
                      } else {
                        if (row.original.id) {
                          handleUpdateItem(row.original.id, row.original);
                        }
                      }
                    }}
                  >
                    <Save />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={() => {
                      if (row.original.id) {
                        handleDeleteItem(row.original.id);
                      } else {
                        handleDeleteRow(row.original.rowId);
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </StyledTable>
      <TableRow>
        <TableCell colSpan={columns.length + 1} style={{ textAlign: "center" }}>
          <strong>Total Items: {filteredData.length}</strong>
        </TableCell>
      </TableRow>

      <SnackbarManager
        open={snackbarOpen}
        message={snackbarMessage}
        onClose={handleCloseSnackbar}
        severity={snackbarSeverity}
      />
    </TableContainer>
  );
};
