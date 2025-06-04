"use client";

import '@/app/css/global.css';
import '@/app/css/Dashboard.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-community/styles/ag-grid.css';

import { AgGridReact } from 'ag-grid-react';
import { redirect } from 'next/navigation';
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';

import { DashboardHeader } from '@/app/components/DashboardHeader';
import {
  addItemValue,
  createNewEntry,
  deleteCategoryItem,
  getCategoryInventoryKeys,
  getCategoryValues,
  setCategoryItems
} from '@/app/fn/category';
import { categoryExists, setNewCategory } from '@/app/requests/inventory';
import { Box, Button, Grid2 as Stack, TextField, Typography, Alert } from '@mui/material';
import Modal from '@mui/material/Modal';

export default function Dashboard() {
  const [activeCategory, setCategory] = useState("");
  const [pendingSaves, setPendingSaves] = useState(new Set());
  const [newCat, setNewCat] = useState("");
  const [permissionLevel, setPermissionLevel] = useState(0);
  const [colDefs, setColDefs] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [inventoryForm, setInventoryForm] = useState([]);
  const [categoryData, setCategoryDataForm] = useState("");
  const [gridApi, setGridApi] = useState(null);
  
  // New state for tracking edits
  const [editedRows, setEditedRows] = useState(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const autoSaveTimeoutRef = useRef(null);

  const categoryInterfaceStyle = {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    height: 620,
    background: "white",
    border: "1px solid #000",
    borderRadius: 5,
    boxShadow: 24,
    p: 4,
  };

  const [open, setOpen] = useState({
    modalTwo: { isActive: false },
    modalThree: { isActive: false },
  });

  const hasPermission = useCallback(() => {
    return permissionLevel >= 1;
  }, [permissionLevel]);

  const handleGridReady = (params) => {
    setGridApi(params.api);
  };

  const cleanGridData = useCallback(() => {
    setColDefs([]);
    setRowData([]);
    setInventoryForm([]);
    setEditedRows(new Map());
    setSaveMessage("");
  }, []);
 
  // Save all edited rows in batch
  const saveAllEditedRows = useCallback(async () => {
    if (!hasPermission() || editedRows.size === 0) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    
    try {
      
      const savePromises = [];
      const updatedRowData = [...rowData];
      
      for (const [rowId, editedFields] of editedRows.entries()) {
        const rowIndex = updatedRowData.findIndex(row => row.id.toString() === rowId);
        
        if (rowIndex === -1) continue;
        
        for (const [field, value] of Object.entries(editedFields)) {
          if (value !== null && value !== "") {
            savePromises.push(
              addItemValue(activeCategory, field, value, rowId)
                .then(() => {
                  // Update local data on successful save
                  updatedRowData[rowIndex][field] = value;
                  return { success: true, rowId, field, value };
                })
                .catch(error => {
                  console.error(`Error saving ${field} for row ${rowId}:`, error);
                  return { success: false, rowId, field, value, error };
                })
            );
          }
        }
      }

      const results = await Promise.allSettled(savePromises);
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      const failCount = results.length - successCount;

      // Update state with successfully saved data
      setRowData(updatedRowData);
      setEditedRows(new Map());

      // Show save status
      if (failCount === 0) {
        setSaveMessage(`Successfully saved ${successCount} changes`);
      } else {
        setSaveMessage(`Saved ${successCount} changes, ${failCount} failed`);
      }

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(""), 3000);

    } catch (error) {
      console.error("Error during batch save:", error);
      setSaveMessage("Error saving changes. Please try again.");
      setTimeout(() => setSaveMessage(""), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [activeCategory, editedRows, hasPermission, rowData]);

  // Modified cell editing handle

  // Rest of your existing functions remain the same...
  const reloadGrid = useCallback(async (category) => {
    if (!category) return;

    try {
      const data = await categoryExists(category);
      const response = await data.json();

      if (category !== activeCategory) {
        cleanGridData();
      }

      if (response.exists) {
        const inventoryKeys = await getCategoryInventoryKeys(category);
        const newColDefs = [
          ...inventoryKeys.map(value => ({
            field: value,
            editable: hasPermission()
          }))
        ];

        setColDefs(newColDefs);
        setInventoryForm(inventoryKeys.map(value => ({
          name: value,
          placeholder: value
        })));

        const categoryValues = await getCategoryValues(category);
        if (categoryValues.values.values.length === 0) {
          setRowData([]);
          return;
        }

        const rows = categoryValues.values.values.map((entry) => {
          const row = { id: entry.id };
          entry.values.forEach((item) => {
            if (item.key && item.value !== null && item.value !== "") {
              row[item.key] = item.value;
            }
          });
          return row;
        });

        setRowData(rows);
      } else {
        setRowData([]);
      }

      setCategory(category);
      localStorage.setItem("lastCategory", category);
    } catch (error) {
      console.error("Error loading grid data:", error);
    }
  }, [activeCategory, cleanGridData, hasPermission]);

  const handleCallback = (childData) => {
    if (childData) {
      // Save any pending edits before switching categories
      if (editedRows.size > 0) {
        saveAllEditedRows();
      }
      setCategory(childData);
      localStorage.setItem("lastCategory", childData);
      reloadGrid(childData);
    }
  };

  const handleOpen = (modal) => () =>
    setOpen({
      ...open,
      [modal]: { isActive: true },
    });

  const handleClose = (modal) => () =>
    setOpen({
      ...open,
      [modal]: { isActive: false },
    });

  const handleDeleteRow = useCallback(async (rowIndex) => {
    const rowToDelete = rowData[rowIndex];
    if (!rowToDelete?.id) return;

    try {
      await deleteCategoryItem(activeCategory, rowToDelete.id);
      setRowData(prev => prev.filter(row => row.id !== rowToDelete.id));
      // Remove from edited rows if it was being edited
      setEditedRows(prev => {
        const newMap = new Map(prev);
        newMap.delete(rowToDelete.id.toString());
        return newMap;
      });
    } catch (error) {
      console.error("Error deleting row:", error);
      alert("Failed to delete row. Please try again.");
    }
  }, [activeCategory, rowData]);

  const deleteButtonRenderer = useCallback((params) => {
    return (
      <Button
        variant="contained"
        color="secondary"
        onClick={() => handleDeleteRow(params.node.rowIndex)}
      >
        Delete
      </Button>
    );
  }, [handleDeleteRow]);

  const updateColumn = (event) => {
    setCategoryDataForm(event.target.value);
  };

  const categoryOnChange = (event) => {
    if (event.target == null) return;
    setNewCat(event.target.value);
  };

  const addNewCategory = useCallback(async () => {
    if (!hasPermission()) {
      alert("You don't have permission to add a category");
      return;
    }

    if (!newCat) {
      alert("Category name cannot be empty");
      return;
    }

    try {
      await setNewCategory(newCat);
      handleClose("modalTwo")();
      reloadGrid(activeCategory);
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    }
  }, [activeCategory, hasPermission, handleClose, reloadGrid, newCat]);

  const addColumnToCategory = useCallback(async () => {
    if (!activeCategory || !categoryData) {
      alert("Category and column name are required");
      return;
    }

    try {
      await setCategoryItems(activeCategory, {
        item_name: categoryData,
      });
      handleClose("modalThree")();
      reloadGrid(activeCategory);
      setCategoryDataForm("");
    } catch (error) {
      console.error("Error adding column:", error);
      alert("Failed to add column. Please try again.");
    }
  }, [activeCategory, categoryData, handleClose, reloadGrid]);

  const newRow = async () => {
    if (!activeCategory) {
      alert("Please select a category first");
      return;
    }

    if (!gridApi) {
      console.log("gridapi not initialized");
      return;
    }

    try {
      const newEntry = await createNewEntry(activeCategory);
      if (newEntry && newEntry.id) {
        setRowData(prev => [...prev, { id: newEntry.id }]);
        console.log(newEntry.id)
      } else {
        console.error("Failed to create new entry");
        alert("Error adding a new row. Please try again.");
      }
    } catch (error) {
      console.error("Error creating new row:", error);
      alert("Error adding a new row. Please try again.");
    }
  };


  const saveCell = useCallback(async (category, field, value, id) => {
    if (!hasPermission()) {
      alert("You don't have permission to edit items");
      return false;
    }

    const saveKey = `${id}-${field}`;
    
    // Prevent duplicate saves
    if (pendingSaves.has(saveKey)) {
      return false;
    }

    setPendingSaves(prev => new Set(prev).add(saveKey));

    try {
      if (value !== null && value !== "") {
        await addItemValue(category, field, value, id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to save data:", error);
      alert("Error saving data. Please try again.");
      return false;
    } finally {
      setPendingSaves(prev => {
        const newSet = new Set(prev);
        newSet.delete(saveKey);
        return newSet;
      });
    }
  }, [hasPermission, pendingSaves]);

  const handleCellEditingStopped = useCallback(async (params) => {
    if (!hasPermission()) return;

    const { data, colDef, newValue, oldValue } = params;
    
    // Only save if value actually changed and row has valid ID
    if (colDef && colDef.field && colDef.field !== 'id' && 
        newValue !== oldValue && data?.id != null) {
      
      const success = await saveCell(activeCategory, colDef.field, newValue, data.id);
      
      if (success) {
        // Update the row data optimistically
        setRowData((prev) =>
          prev.map((row) =>
            row.id === data.id ? { ...row, [colDef.field]: newValue } : row
          )
        );
      } else {
        // Revert the change if save failed
        gridApi?.refreshCells({
          rowNodes: [params.node],
          columns: [colDef.field],
          force: true
        });
      }
    }
  }, [activeCategory, hasPermission, saveCell, gridApi]);



  const defaultColDef = useMemo(() => ({
    flex: 1,
    editable: hasPermission(),
    singleClickEdit: true, // Allow single click editing
    stopEditingWhenCellsLoseFocus: true
  }), [hasPermission]);

  // Add this helper function
  const validateRowData = (data) => {
    return data.filter(row => {
      // Ensure each row has a valid ID
      if (!row.id) {
        console.warn("Row missing ID:", row);
        return false;
      }
      return true;
    });
  };

  // Update setRowData calls to use validation
  const updateRowData = (newData) => {
    const validatedData = validateRowData(newData);
    setRowData(validatedData);
  };


  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const storageExists = () => {
      return localStorage.getItem("user") !== null;
    };

    const isLoggedIn = () => {
      if (!storageExists()) {
        redirect("/");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      if (user === null) {
        redirect("/l");
      }
    };

    const setPermission = () => {
      if (!storageExists()) return;
      const user = JSON.parse(localStorage.getItem("user"));
      setPermissionLevel(user.permissionLevel);
    };

    const loadLastCategory = () => {
      const lastCategory = localStorage.getItem("lastCategory");
      if (lastCategory) {
        setCategory(lastCategory);
        reloadGrid(lastCategory);
      }
    };

    setPermission();
    isLoggedIn();
    loadLastCategory();

    document.title = "Inventarisatie - Dashboard";
  }, [reloadGrid]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (editedRows.size > 0) {
        e.preventDefault();
        e.returnValue = '';
        saveAllEditedRows();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editedRows.size, saveAllEditedRows]);

  return (
    <div className="container">
      <header className="global-header-wrapper">
        <DashboardHeader
          headerNavClassname="global-header"
          categoryState={activeCategory}
          parentCallback={handleCallback}
        />
      </header>
      <div className="dashboard-container">
        {/* Save Status Alert */}
        {(editedRows.size > 0 || saveMessage || isSaving) && (
          <Alert 
            severity={saveMessage.includes('Error') ? 'error' : editedRows.size > 0 ? 'warning' : 'success'}
            style={{ marginBottom: '10px' }}
          >
            {isSaving ? 'Saving changes...' : 
             saveMessage || 
             `${editedRows.size} unsaved changes (auto-save in 3 seconds)`}
          </Alert>
        )}

        {/* Your existing modals */}
        <Modal
          open={open.modalTwo.isActive}
          onClose={handleClose("modalTwo")}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={categoryInterfaceStyle}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Add New Category
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Category"
                variant="outlined"
                name="category"
                onChange={categoryOnChange}
              />
              <Button variant="contained" onClick={addNewCategory}>
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Modal
          open={open.modalThree.isActive}
          onClose={handleClose("modalThree")}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={categoryInterfaceStyle}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Add New Column to Category
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Column"
                variant="outlined"
                name="column"
                value={categoryData}
                onChange={updateColumn}
              />
              <Button variant="contained" onClick={addColumnToCategory}>
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        <div className="ag-theme-quartz" style={{ height: 750, width: 1400 }}>
          {hasPermission() && (
            <div className="inventory-button-group">
              <button
                className="open-new-category"
                onClick={handleOpen("modalTwo")}
              >
                New category
              </button>
              {activeCategory && (
                <button
                  className="open-new-category"
                  onClick={handleOpen("modalThree")}
                >
                  Add column to category
                </button>
              )}
              <button className='new-row' onClick={newRow}>
                New row
              </button>
              {editedRows.size > 0 && (
                <button 
                  className='save-all-changes'
                  onClick={saveAllEditedRows}
                  disabled={isSaving}
                  style={{ 
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {isSaving ? 'Saving...' : `Save All (${editedRows.size})`}
                </button>
              )}
            </div>
          )}
          <div className="grid-res">
            <AgGridReact
              onGridReady={handleGridReady}
              onCellEditingStopped={handleCellEditingStopped}
              rowData={rowData}
              columnDefs={
                colDefs.length > 0
                  ? [
                      ...colDefs,
                      {
                        headerName: "Actions",
                        field: "actions",
                        cellRenderer: deleteButtonRenderer,
                        width: 150,
                        pinned: "right",
                      },
                    ]
                  : colDefs
              }
              defaultColDef={defaultColDef}
              stopEditingWhenCellsLoseFocus={true}
              pagination={true}
              paginationPageSize={15}
              getRowId={params => {
                return params.data?.id?.toString() || `row-${params.node?.rowIndex || Math.random()}`;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
