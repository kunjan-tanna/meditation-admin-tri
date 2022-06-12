import React from 'react';

const Dashboard = React.lazy(() => import('./views/Dashboard/Dashboard'));

const Meditations = React.lazy(() => import('./views/Meditations/Meditations'));
const Add_Edit_Meditation = React.lazy(() => import('./views/Meditations/Add-Edit-Meditation'));
const Category = React.lazy(() => import('./views/Category/Category'));
const Add_Edit_Category = React.lazy(() => import('./views/Category/Add-Edit-Category'));
const SubCategory = React.lazy(() => import('./views/SubCategory/SubCategory'));
const Add_Edit_Sub_Category = React.lazy(() => import('./views/SubCategory/Add-Edit-Sub-Category'));

let routes = [
  { path: process.env.PUBLIC_URL + '/dashboard', exact: true, name: 'Dashboard', component: Dashboard },
  { path: process.env.PUBLIC_URL + '/meditations', exact: true, name: 'Meditations', component: Meditations },
  { path: process.env.PUBLIC_URL + '/meditations/edit/:meditation_id', exact: true, name: 'Edit Meditation', component: Add_Edit_Meditation },
  { path: process.env.PUBLIC_URL + '/meditations/addmeditation/', exact: true, name: 'Add Meditation', component: Add_Edit_Meditation },
  { path: process.env.PUBLIC_URL + '/categories', exact: true, name: 'Categories', component: Category },
  { path: process.env.PUBLIC_URL + '/categories/edit/:category_id', exact: true, name: 'Edit Category', component: Add_Edit_Category },
  { path: process.env.PUBLIC_URL + '/categories/addcategory/', exact: true, name: 'Add Category', component: Add_Edit_Category },
  { path: process.env.PUBLIC_URL + '/sub-categories', exact: true, name: 'Sub-Categories', component: SubCategory },
  { path: process.env.PUBLIC_URL + '/sub-categories/edit/:category_id', exact: true, name: 'Edit Sub Category', component: Add_Edit_Sub_Category },
  { path: process.env.PUBLIC_URL + '/sub-categories/addSubcategory', exact: true, name: 'Add Sub Category', component: Add_Edit_Sub_Category },
];

export default routes;
