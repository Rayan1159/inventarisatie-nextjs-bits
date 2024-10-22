// import { Link } from "react-router-dom";
// import { HeaderNav } from "./SubComponents/HeaderNav";
// import React, { useEffect, useState } from "react";
// import { loadNewCategory } from "../../fn/category";
// import { getCategoryKeys } from "../../requests/inventory";

// interface DashboardHeaderProps {
//   headerNavClassname?: string;
//   categoryState: string;
//   setCategoryState: (category: string) => void;
// }

// export function DashboardHeader({ headerNavClassname, categoryState, setCategoryState }: DashboardHeaderProps) {
//   const [selectValue, setSelectValue] = useState("");
//   const [selectItems, setSelectItems] = useState<React.ReactNode[]>([]);

//   const updateCategory = async () => {
//     const targetSelect = selectValue;
//     if (targetSelect === "Select category") {
//       return; 
//     }

//     if (targetSelect === categoryState) return;

//     const loadedCategory = await loadNewCategory(targetSelect);
//     if (loadedCategory == null) return;

//     setCategoryState(loadedCategory);
//   }

//   const selectMenuStyle = {
//     backgroundColor: "transparent",
//     border: "none",
//     padding: "5px",
//     borderRadius: "5px",
//     color: "white",
//   }

//   useEffect(() => {
//     const fetchSelectItems = async (): Promise<React.ReactNode[]> => {
//       const keys = await getCategoryKeys();
//       return keys.map((key: { id: number, name: string }) => (
//         <option key={key.id}>{key.name}</option>
//       ));
//     }

//     fetchSelectItems().then((items: React.ReactNode[]) => {
//       setSelectItems(prevItems => [...prevItems, ...items]);
//     });
//   }, []);

//   return (
//     <div>
//       <nav className={headerNavClassname}>
//         <HeaderNav>
//           <li>
//             <Link to="/logout">Logout</Link>
//           </li>
//           <li> 
//             <select 
//               style={selectMenuStyle} 
//               onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectValue(e.target.value)}
//              >
//               <option>Select category</option> 
//               {selectItems}
//             </select>
//           </li>
//         </HeaderNav>
//       </nav>
//     </div>
//   );
// }
