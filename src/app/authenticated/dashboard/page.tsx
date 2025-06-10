"use client";

import "@/app/css/Dashboard.css";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { AgGridReact } from 'ag-grid-react';
import { getCategoryInventoryKeys } from "@/app/fn/category";

export default function Inventory() {
    const [category, setCategory] = useState("");
    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([]);

    const [loading, setLoading] = useState(false);

    const loadInventoryKeys = async () => {
       setLoading(true);
       const inventoryKeys = await getCategoryInventoryKeys(category);
         const newColDefs = [
          ...inventoryKeys.map(value => ({
            field: value
          }))
         ]
         if (newColDefs) {
            setColDefs(newColDefs);
            setLoading(false)
         }
     }
    
    const defaultColDef = useMemo(() => ({
      flex: 1,
      singleClickEdit: true, 
      stopEditingWhenCellsLoseFocus: true
    }), []);
    

    const LoadingSpinner = () => {
      return (
        <div className="loading-spinner-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-text">Loading...</div>
          </div>
        </div>
      );
    };


    const InventoryHeader = () => {
      return (
        <header className="inventory-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Bitsenbytes inventarisatie</h1>
            </div>
            
            <div className="header-controls">
              <div className="category-selector">
                <label htmlFor="category-select">Categorie:</label>
                <select 
                  id="category-select"
                  value={category} 
                  onChange={(e) => {
                    setCategory(e.target.value);
                    loadInventoryKeys();
                  }}
                  className="category-dropdown"
                >
                  <option value="">{!category ? "Selecteer category" : category}</option>
                  <option value="test">Test</option>
                </select>
              </div>
              
              <div className="inventory-button-group">
              {category ? (
                <button className="btn btn-primary header-btn">
                  <span className="btn-icon">+</span>
                    Add Item
                </button>
              ) : null}

              <button className="btn btn-logout header-btn" onClick={(e) => {
                alert('uitgelogd')
              }}>
                <span className="btn-icon">⏻</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
      )
    }


    if (loading) {
      return (
        <LoadingSpinner/>
      )
    }
    
    return (
        <div className="container">
          <div>
            <InventoryHeader/>
          </div>
          <div className="ag-theme-quartz" style={{ height: 500, width: 1850 }}>
            <div className="grid-container">
              <div className="grid-res">
              <AgGridReact
                rowData={rowData}
                defaultColDef={defaultColDef}
                columnDefs={
                  colDefs.length > 0
                  ? [
                    ...colDefs,
                    {
                      headerName: "Actions",
                      field: "actions",
                      width: 150,
                      pinned: "right"
                    },
                  ] : colDefs
                }
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
    )
} 