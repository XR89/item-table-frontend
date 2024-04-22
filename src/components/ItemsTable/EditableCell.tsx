import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { EditableCellProps } from "../../types/types";
import { itemTypes } from "../../constants/itemTypes";

const EditableCell: React.FC<EditableCellProps> = ({
  value: initialValue,
  row: { index },
  column,
  updateItemData,
}) => {
  const [value, setValue] = useState(initialValue);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const newValue = e.target.value as string;
    setValue(newValue);
    updateItemData(index, column.id, newValue);
  };

  const onSelectChange = (event: SelectChangeEvent<string>) => {
    const newValue = event.target.value as string;
    setValue(newValue);
    updateItemData(index, column.id, newValue);
  };

  // Effect to update local state when initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return column.Header === "Category" ? (
    <FormControl fullWidth>
      <Select value={value} onChange={onSelectChange} displayEmpty>
        {itemTypes.map((type, idx) => (
          <MenuItem key={idx} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : column.Header === "Price" ? (
    <TextField type="number" value={value} onChange={onChange} fullWidth />
  ) : (
    <TextField value={value} onChange={onChange} fullWidth />
  );
};

export default EditableCell;
