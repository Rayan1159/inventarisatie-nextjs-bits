"use client";

import React from "react";
import Modal from '@mui/material/Modal';
import { AgGridReact } from "ag-grid-react";
import { Box, Typography, TextField, Button, Stack, Grid2 as Grid } from "@mui/material";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { categoryExists, setNewCategory } from "@/app/requests/inventory";
import { getCategoryInventoryKeys, getInventoryItems } from "@/app/fn/category";
import { redirect } from "next/navigation";
import '@/app/css/global.css';
import "@/app/css/Dashboard.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-community/styles/ag-grid.css";

export default function Dashboard() {
  const [category, setCategory] = React.useState('');
  const [permissionLevel, setPermissionLevel] = React.useState(0);

  const [dynamicRowData] = React.useState<Record<string, any>>({})
  const [colDefs, setColDefs] = React.useState<Record<string, any>>([])
  const [rowData, setRowData] = React.useState<Record<string, any>>([])

  const [inventoryForm] = React.useState<Record<string ,any>>({});

  const inventoryInterfaceStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600, 
    height: 620,
    background: "white",
    border: '1px solid #000',
    borderRadius: 5,
    boxShadow: 24,
    p: 4,
  };

  const categoryInterfaceStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800, 
    height: 620,
    background: "white",
    border: '1px solid #000',
    borderRadius: 5,
    boxShadow: 24,
    p: 4,
  }

  const [open, setOpen] = React.useState({
    modalOne: {
      isActive: false,
    },
    modalTwo: {
      isActive: false
    }
  });

  const reloadGrid = async (category: string) => {
    const data = await categoryExists(category);
    const response = await data.json();
    if (response.exists === true) {
      const inventoryKeys: string[] = await getCategoryInventoryKeys(category);
      inventoryKeys.forEach((value, key) => {
        setRowData({
            [value]: value
        })
        setColDefs([{
          field: value,
        }])
      });
      console.log(inventoryForm);
    }
    assignInputs(category);
  }

  const categoriesEmpty = () => {
    return category.length === 0;
  }

  const handleCallback = (childData: any) => {
    reloadGrid(childData);
  }

  const handleOpen = (modal: string) => () => setOpen({
    ...open,
    [modal]: {
      isActive: true
    }
  });

  const handleClose = (modal: string) => () => setOpen({
    ...open,
    [modal]: {
      isActive: false
    }
  });

  const defaultColDef = {
    flex: 1
  }

  const assignInputs = (category: string) => {
      const placeholder = colDefs;
  }

  const inputFields = [
    { placeholder: "Name", name: "name" },
    { placeholder: "Description", name: "description" },
    { placeholder: "Additional", name: "additional" },
    { placeholder: "Place", name: "place" },
    { placeholder: "Processor", name: "processor" },
    { placeholder: "RAM", name: "ram" },
    { placeholder: "Drive", name: "drive" },
    { placeholder: "Power cable", name: "powerCable" },
    { placeholder: "Needs additional", name: "needsAdditional" },
    { placeholder: "Recent actions", name: "recentActions" },
    { placeholder: "Required action", name: "requiredAction" }
  ];

  const categoryOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target == null) return;
    setCategory(event.target.value);
  }

  const addNewCategory = () => {
    if (!hasPermission()) {
      alert('Je hebt geen permissie om een categorie toe te voegen');
      return;
    }

    if (category) {
      setNewCategory(category);
    } else {
      console.error('category cannot be empty');
    }
  }

  // const handleInventoryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = event.target;
  //   setInventoryForm({
  //     ...inventoryForm,
  //     [name]: value,
  //   });
  // };

  const handleInventorySubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setInventoryForm({
      name: '',
      description: '',
      additional: '',
      place: '',
      processor: '',
      ram: '',
      drive: '',
      powerCable: '',
      needsAdditional: '',
      recentActions: '',
      requiredAction: ''
    });

    handleClose('modalOne')();
  };

  const hasPermission = () => {
    return permissionLevel >= 1;
  }

  React.useEffect(() => {
      const storageExists = () => {
        return localStorage.getItem("user") !== null;
      } 

      const isLoggedIn = () => {
        if (!storageExists()) return;
        const user = JSON.parse(localStorage.getItem("user")!);
        if(user === null){
          redirect('/login');
        }
      }

      const setPermission = () => {
        const user = JSON.parse(localStorage.getItem("user")!);
        if (!storageExists()) return;
        setPermissionLevel(user.permissionLevel);
      }

      // Promise.all([ 
      //   getInventoryItems(category),
      // ]).then((data) => {
      //   console.log(data[0]);
      //   // const rowData: string[] = data[0].map((row: {
      //   //   _id: number;
      //   // }) => {
      //   //   return {
      //   //     ...row,
      //   //     id: row._id,
      //   //   }
      //   // });
      //   // setRowData(rowData);
      // })
      // .catch((err) => {
      //   console.error(err);
      // });
      document.title = "Inventarisatie - Dashboard";
      setPermission();
      isLoggedIn();
  }, []);

  return (
    <div className="container">
      <header className="global-header-wrapper">
        <DashboardHeader headerNavClassname="global-header" categoryState={category} parentCallback={handleCallback}/>
      </header>
      <div className="dashboard-container">
      <Modal
        open={open.modalOne.isActive}
        onClose={handleClose('modalOne')}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box component="form" sx={inventoryInterfaceStyle} onSubmit={handleInventorySubmit}>
        <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
          New Inventory Entry for category {category}
        </Typography>
        <Grid container spacing={2}>
          {inputFields.map((field, index) => (
            <Grid key={index}>
              <TextField
                fullWidth
                label={field.placeholder}
                name={field.name}
                // onChange={handleInventoryInputChange}
                variant="outlined"
              />
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" type="submit">
            Submit
             </Button>
              <Button variant="outlined" onClick={handleClose('modalOne')}>
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
            <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
              Nieuwe categorie toevoegen
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Category"
                variant="outlined"
                name="category"
                value={category}
                onChange={categoryOnChange}
              />
              <Button variant="contained" onClick={addNewCategory}>
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <div className="ag-theme-quartz" style={{ height: 750, width: 1400 }}>
          {hasPermission() ? 
           <div className="inventory-button-group">
              <button className="open-interface" onClick={handleOpen('modalOne')}>New inventory entry</button>
              <button className="open-new-category" onClick={handleOpen('modalTwo')}>New category</button>
            </div> : null
          }
          <div className="grid-res">
            <AgGridReact
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
