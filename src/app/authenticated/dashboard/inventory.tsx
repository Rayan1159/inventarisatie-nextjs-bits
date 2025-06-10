"use client";

import "@/app/css/Dashboard.css";
import { useState } from "react";

export default function Inventory() {
    const [category, setCategory] = useState("");
    
    return (
        <div className="container">
      <header className="global-header-wrapper">
        {/* <DashboardHeader
          headerNavClassname="global-header"
          categoryState={activeCategory}
          parentCallback={handleCallback}
        /> */}
      </header>
      <div className="dashboard-container">
        {/* Save Status Alert */}
        <div className="ag-theme-quartz" style={{ height: 750, width: 1400 }}>
          {/* <div className="grid-res">
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
          </div> */}
        </div>
      </div>
    </div>
    )
} 