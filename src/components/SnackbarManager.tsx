import React from "react";
import { Snackbar, Alert } from "@mui/material";

interface SnackbarManagerProps {
  open: boolean;
  message: string;
  onClose: () => void;
  severity: "success" | "error" | "warning";
}

const SnackbarManager: React.FC<SnackbarManagerProps> = ({
  open,
  message,
  onClose,
  severity,
}) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarManager;
