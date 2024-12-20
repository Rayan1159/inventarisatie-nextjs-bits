"use client";

import React from "react";
import Modal from "@mui/material/Modal";
import { AgGridReact } from "ag-grid-react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Grid2 as Grid,
} from "@mui/material";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { categoryExists, setNewCategory } from "@/app/requests/inventory";
import {
  addItemValue,
  getCategoryInventoryKeys,
  getCategoryValues,
  setCategoryItems,
} from "@/app/fn/category";
import { redirect } from "next/navigation";
import "@/app/css/global.css";
import "@/app/css/Dashboard.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-community/styles/ag-grid.css";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [activeCategory, setCategory] = React.useState("");
  const [permissionLevel, setPermissionLevel] = React.useState(0);

  const [colDefs, setColDefs] = React.useState<Record<string, any>[]>([]);
  const [rowData, setRowData] = React.useState<Record<string, any>[]>([]);

  const [inventoryForm, setInventoryForm] = React.useState<
    Record<string, any>[]
  >([]);
  const [categoryData, setCategoryDataForm] = React.useState<string>("");

  const router = useRouter();

  const inventoryInterfaceStyle = {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    height: 620,
    background: "white",
    border: "1px solid #000",
    borderRadius: 5,
    boxShadow: 24,
    p: 4,
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

    if (category !== activeCategory) {
      cleanGridData();
    }

    if (response.exists === true) {
      const inventoryKeys: string[] = await getCategoryInventoryKeys(
        category
      ).finally(() => console.log("fetched keys"));

      inventoryKeys.forEach((value, index) => {
        setColDefs((colDefs) => [
          ...colDefs,
          {
            field: value,
          },
        ]);

        colDefs.push([
          {
            field: value,
          },
        ]);
        assignInputs(colDefs);
      });
    }

    const newRow = Object.keys(categoryValues.values).reduce((acc, value) => {
      const entry = categoryValues.values[value];
      acc[entry.key] = entry.value;
      return acc;
    }, {});
    
    setRowData((prevRowData) => [...prevRowData, newRow]);
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

  const defaultColDef = {
    flex: 1,
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

  const addCategoryItem = () => {
    if (!activeCategory) {
      alert("No category is selected.");
      return;
    }

    const newRow = inventoryForm.reduce((acc, item) => {
      acc[item.name] = item.placeholder || "";

      addItemValue(activeCategory, item.name, item.placeholder);
      return acc;
    }, {} as Record<string, any>);

    setRowData((prevRowData) => [...prevRowData, newRow]);

    setInventoryForm((prevForm) =>
      prevForm.map((field) => ({ ...field, placeholder: "" }))
    );
  };

  const addColumnToCategory = () => {
    if (!activeCategory) return;
    setCategoryItems(activeCategory, {
      item_name: categoryData,
    });
    router.refresh();
  };

  const handleInventoryInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setInventoryForm((prevForm) =>
      prevForm.map((item) =>
        item.name === name ? { ...item, placeholder: value } : item
      )
    );
  };

  const handleInventorySubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // setInventoryForm({
    //   name: '',
    //   description: '',
    //   additional: '',
    //   place: '',
    //   processor: '',
    //   ram: '',
    //   drive: '',
    //   powerCable: '',
    //   needsAdditional: '',
    //   recentActions: '',
    //   requiredAction: ''
    // });

    handleClose("modalOne")();
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
          open={open.modalOne.isActive}
          onClose={handleClose("modalOne")}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            component="form"
            sx={inventoryInterfaceStyle}
            onSubmit={handleInventorySubmit}
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              gutterBottom
            >
              New Inventory Entry for category {activeCategory}
            </Typography>
            <Grid container spacing={2}>
              {inventoryForm.map((field, index) => (
                <Grid key={index}>
                  <TextField
                    fullWidth
                    label={field.placeholder}
                    name={field.name}
                    onChange={handleInventoryInputChange}
                    variant="outlined"
                  />
                </Grid>
              ))}
            </Grid>
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 3, justifyContent: "flex-end" }}
            >
              <Button
                variant="contained"
                color="primary"
                type="submit"
                onClick={addCategoryItem}
              >
                Submit
              </Button>
              <Button variant="outlined" onClick={handleClose("modalOne")}>
                Cancel
              </Button>
            </Stack>
          </Box>
        </Modal>
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
                className="open-interface"
                onClick={handleOpen("modalOne")}
              >
                New inventory entry
              </button>
              <button
                className="open-new-category"
                onClick={handleOpen("modalTwo")}
              >
                New category
              </button>
              {activeCategory ? (
                <button
                  className="open-new-category"
                  onClick={handleOpen("modalThree")}
                >
                  Add column to category
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="grid-res">
            <AgGridReact
              onRowDoubleClicked={(e) => {
                const element: HTMLDivElement = e.event.target;
              }}
              rowData={rowData}
              columnDefs={colDefs as any}
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
