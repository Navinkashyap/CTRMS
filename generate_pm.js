const fs = require('fs');

const vendorListPath = 'src/pages/VendorMangerList.jsx';
const vendorAddPath = 'src/pages/AddVendorManger.jsx';
const pmListPath = 'src/pages/ProjectManger.jsx';
const pmAddPath = 'src/pages/AddProjectManger.jsx';

let listContent = fs.readFileSync(vendorListPath, 'utf8');
let addContent = fs.readFileSync(vendorAddPath, 'utf8');

// Replace logic in list
listContent = listContent
  .replace(/VendorList/g, 'ProjectManagerList')
  .replace(/Vendor Manger/g, 'Project Manager')
  .replace(/Vendor Manger/g, 'Project Manager')
  .replace(/ACTIVE VENDORS/g, 'ACTIVE MANAGERS')
  .replace(/vendors\/add-vendor/g, 'project-managers/add')
  .replace(/Add New Vendor/g, 'Add New Project Manager')
  .replace(/vendors/g, 'projectManagers')
  .replace(/vendor/g, 'projectManager')
  .replace(/Vendors/g, 'ProjectManagers')
  .replace(/Vendor/g, 'ProjectManager')
  .replace(/getProjectManagers/g, 'getProjectManagers') // it might replace API name
  .replace(/projectManagerApi/g, 'projectManagerApi');

// Fix API imports
listContent = listContent.replace(
  /import \{ (.*) \} from '\.\.\/lib\/vendorApi';/,
  "import { getProjectManagers, createProjectManager, updateProjectManager, deleteProjectManager } from '../lib/projectManagerApi';"
);
listContent = listContent.replace(/getVendors/g, 'getProjectManagers');
listContent = listContent.replace(/createVendor/g, 'createProjectManager');
listContent = listContent.replace(/updateVendor/g, 'updateProjectManager');
listContent = listContent.replace(/deleteVendor/g, 'deleteProjectManager');

listContent = listContent.replace(/projectManagers\.length/g, 'projectManagers.length');
listContent = listContent.replace(/ProjectManagers/g, 'Project Managers');
listContent = listContent.replace(/Project Manager Manger/g, 'Project Manager'); // Cleanup any accidental double manger
listContent = listContent.replace(/Project ManagerList/g, 'ProjectManagerList'); 
listContent = listContent.replace(/filteredprojectManagers/g, 'filteredProjectManagers');
listContent = listContent.replace(/setprojectManagers/g, 'setProjectManagers');
listContent = listContent.replace(/loadprojectManagers/g, 'loadProjectManagers');
listContent = listContent.replace(/filteredProjectManagers\.map\(\(projectManager, index\)/g, 'filteredProjectManagers.map((projectManager, index)');
listContent = listContent.replace(/setProjectManagers\(data\)/g, 'setProjectManagers(data)');
listContent = listContent.replace(/const \[projectManagers, setProjectManagers\] = useState/g, 'const [projectManagers, setProjectManagers] = useState');

// Replace logic in add form
addContent = addContent
  .replace(/AddVendor/g, 'AddProjectManager')
  .replace(/editingVendor/g, 'editingProjectManager')
  .replace(/vendor/g, 'projectManager')
  .replace(/Vendor/g, 'ProjectManager')
  .replace(/vendors/g, 'projectManagers')
  .replace(/projectManagers\/add-projectManager/g, 'project-managers/add')
  .replace(/\/projectManagers/g, '/project-managers')
  .replace(/Onboard New ProjectManager/g, 'Onboard New Project Manager')
  .replace(/Create ProjectManager/g, 'Create Project Manager');

addContent = addContent.replace(
  /import \{ createVendor, updateVendor \} from '\.\.\/lib\/vendorApi';/,
  "import { createProjectManager, updateProjectManager } from '../lib/projectManagerApi';"
);
addContent = addContent.replace(/createVendor/g, 'createProjectManager');
addContent = addContent.replace(/updateVendor/g, 'updateProjectManager');

fs.writeFileSync(pmListPath, listContent);
fs.writeFileSync(pmAddPath, addContent);
console.log('Files generated successfully.');
