"use client";

import '@/app/css/global.css';
import '@/app/css/Dashboard.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-community/styles/ag-grid.css';

import { AgGridReact } from 'ag-grid-react';
import { redirect } from 'next/navigation';
import React from 'react';

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
import { Box, Button, Grid2 as Stack, TextField, Typography } from '@mui/material';
import Modal from '@mui/material/Modal';

export default function Dashboard() {
  const [activeCategory, setCategory] = React.useState("");
  const [permissionLevel, setPermissionLevel] = React.useState(0);

  const [colDefs, setColDefs] = React.useState<Record<string, any>[]>([]);
  const [rowData, setRowData] = React.useState<Record<string, any>[]>([]);

  const [inventoryForm, setInventoryForm] = React.useState<
    Record<string, any>[]
  >([]);
  const [categoryData, setCategoryDataForm] = React.useState<string>("");

  const [gridApi, setGridApi] = React.useState(null);


  const handleGridReady = (params: any) => {
    setGridApi(params.api);
  };

  const refreshGrid = () => {
    if (gridApi) {
      gridApi.refreshCells();
    }
  };

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

  const [open, setOpen] = React.useState({
    modalOne: {
      isActive: false,
    },
    modalTwo: {
      isActive: false,
    },
    modalThree: {
      isActive: false,
    },
  });

  const cleanGridData = () => {
    setColDefs((colDefs) => []);
    rowData?.forEach((row) =>
      row.values.forEach((value) => (value.value = null))
    );
  };

  const updateColumn = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryDataForm(event.target.value);
  };

  const assignInputs = (categoryValues: any[]) => {
    console.log(categoryValues);
    const updatedInventoryForm = categoryValues.flat().map((value) => {
      return {
        name: value.field,
        placeholder: value.field
      }
    });
    setInventoryForm((form) => [...form, ...updatedInventoryForm]);
    return inventoryForm;
  };


  const reloadGrid = async (category: string) => {
    const data = await categoryExists(category);
    const categoryValues = await getCategoryValues(category);
    const response = await data.json();

    const newColDefsObj = {
      field: 'id', 
      headerName: 'ID', 
      editable: false, 
      filter: true,
      width: 100 
    }
  
    if (category !== activeCategory) {
      cleanGridData();
    }
  
    if (response.exists === true) {
      const inventoryKeys: string[] = await getCategoryInventoryKeys(category);

      const newColDefs = [
        newColDefsObj,
        ...inventoryKeys.map(value => ({ 
          field: value, 
          editable: hasPermission() // Only editable with permissions
        }))
      ];
      setColDefs(newColDefs);
      assignInputs(newColDefs);
    }
  
    if (categoryValues.values.length === 0) {
      setRowData([]);
      return;
    }
  
    const rows = categoryValues.values.values.map((entry: any) => {
      const row: Record<string, any> = { id: entry.id }; // Preserve ID
      
      entry.values.forEach((item: any) => {
        row[item.key] = item.value;
      });
      
      return row;
    });
    setCategory(category);
  };
  

  const handleCallback = (childData: any) => {
    reloadGrid(childData);
  };

  const handleOpen = (modal: string) => () =>
    setOpen({
      ...open,
      [modal]: {
        isActive: true,
      },
    });

  const handleClose = (modal: string) => () =>
    setOpen({
      ...open,
      [modal]: {
        isActive: false,
      },
    });

    const handleDeleteRow = (rowIndex: number) => {
      const rowToDelete = rowData[rowIndex];
      if (!rowToDelete?.id) return;
      deleteCategoryItem(activeCategory, rowToDelete.id).then(() => {
          setRowData(prev => prev.filter(row => row.id !== rowToDelete.id));
   
          reloadGrid(activeCategory);
      });
  };

  const deleteButtonRenderer = (params: any) => {
    return (
      <Button
        variant="contained"
        color="secondary"
        onClick={() => handleDeleteRow(params.node.rowIndex)}
      >
        Delete
      </Button>
    );
  };

  const defaultColDef = {
    flex: 1,
    editable: true,
    onCellValueChanged: (params: any) => {
      if (!hasPermission()) {
        alert("Je hebt geen permissie om items te bewerken");
        return;
      }
      const { data, colDef, newValue } = params;
      console.log("Data:", data);
      if (colDef && colDef.field) {
        addItemValue(activeCategory, colDef.field, newValue, data.id);
        refreshGrid();
      }
    },
  };

  const categoryOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target == null) return;
    setCategory(event.target.value);
  };

  const addNewCategory = () => {
    if (!hasPermission()) {
      alert("Je hebt geen permissie om een categorie toe te voegen");
      return;
    }

    if (activeCategory) {
      setNewCategory(activeCategory);
    } else {
      console.error("category cannot be empty");
    }
  };


  const addColumnToCategory = async () => {
    if (!activeCategory) return;
    await setCategoryItems(activeCategory, {
      item_name: categoryData,
    });
    reloadGrid(activeCategory);
  };

  const hasPermission = () => {
    return permissionLevel >= 1;
  };

  React.useEffect(() => {
    const storageExists = () => {
      return localStorage.getItem("user") !== null;
    };

    const isLoggedIn = () => {
      if (!storageExists()) return;
      const user = JSON.parse(localStorage.getItem("user")!);
      if (user === null) {
        redirect("/login");
      }
    };

    const setPermission = () => {
      const user = JSON.parse(localStorage.getItem("user")!);
      if (!storageExists()) return;
      setPermissionLevel(user.permissionLevel);
    };
    setPermission();
    isLoggedIn();

    document.title = "Inventarisatie - Dashboard";
  }, []);

  const newRow = async () => {
    if (activeCategory === "") {
      alert('Selecteer een categorie');
      return;
    }

    if (!gridApi) return console.log("gridapi not initialized");

    inventoryForm.forEach((column) => {
      console.log("Column name:", column.name);
    });

    const activeRows: any[] = [];
    gridApi.forEachNode((node: any) => {
      activeRows.push(node.data);
    });

    if (inventoryForm.length < 1) {
      console.warn("Only the ID column exists.");
      return;
    }
    
    const newEntry = await createNewEntry(activeCategory);
    const newRowEntry: Record<string, any> = { id: newEntry.id };
    inventoryForm.forEach((item) => {
      newRowEntry[item.name] = item.placeholder || "";
    });
    setRowData([...activeRows, newRowEntry]);
  }

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
              Nieuwe categorie toevoegen
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Category"
                variant="outlined"
                name="category"
                value={activeCategory}
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
              Nieuw column toevoegen aan categorie
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Column"
                variant="outlined"
                name="column"
                onChange={updateColumn}
              />
              <Button variant="contained" onClick={addColumnToCategory}>
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <div className="ag-theme-quartz" style={{ height: 750, width: 1400 }}>
          {hasPermission() ? (
            <div className="inventory-button-group">
              <button
                className="open-new-category"
                onClick={handleOpen("modalTwo")}
              >
                New category
              </button>
              {activeCategory ? (
                <>
                  <button
                    className="open-new-category"
                    onClick={handleOpen("modalThree")}
                  >
                    Add column to category
                  </button>
                  <button className='new-row'>
                    
                  </button>
                </>
              ) : null}
              <button className='new-row' onClick={newRow}>
                New row
              </button>
            </div>
          ) : null}
          <div className="grid-res">
            <AgGridReact
              onGridReady={handleGridReady}
              onCellValueChanged={(params) => {
                if (!hasPermission()) {
                  alert("Je hebt geen permissie om items te bewerken");
                  return;
                }
                const { data, colDef, newValue } = params;
                if (colDef && colDef.field) {
                  addItemValue(activeCategory, colDef.field, newValue);
                  refreshGrid();
                }
              }}
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
              pagination={true}
              paginationPageSize={15}
              fullWidthCellRenderer={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
