import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();

async function loadIfc() {
		// Load the model
   
    const model = await viewer.IFC.loadIfcUrl('./01.ifc');

		// Add dropped shadow and post-processing efect
    await viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.postProduction.active = true;


    //dimension
    
viewer.dimensions.active = true;
viewer.dimensions.previewActive = true;


window.ondblclick = () => {
  viewer.dimensions.create();
}

window.onkeydown = (event) => {
  if(event.code === 'Delete') {
      viewer.dimensions.delete();
  }
}


//tree 


    const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
    createTreeMenu(ifcProject);
}

loadIfc('./path/to/file.ifc');


window.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();

// window.ondblclick = async () => {
//   const result = await viewer.IFC.selector.highlightIfcItem();
//   if (!result) return;
//   const { modelID, id } = result;
//   const props = await viewer.IFC.getProperties(modelID, id, true, false);
//   console.log(props);
// };


window.ondblclick = async () => {
  const result = await viewer.IFC.selector.pickIfcItem(true);
  

  const { modelID, id } = result;
    const props = await viewer.IFC.getProperties(modelID, id, true, false);
    console.log(props);
   
  // getPropertySets(foundProperties);
  // console.log(foundProperties);
};

// Tree view

const toggler = document.getElementsByClassName("caret");
for (let i = 0; i < toggler.length; i++) {
    toggler[i].onclick = () => {
        toggler[i].parentElement.querySelector(".nested").classList.toggle("active");
        toggler[i].classList.toggle("caret-down");
    }
}

// Spatial tree menu

function createTreeMenu(ifcProject) {
  const root = document.getElementById("tree-root");
  removeAllChildren(root);
  const ifcProjectNode = createNestedChild(root, ifcProject);
  ifcProject.children.forEach(child => {
      constructTreeMenuNode(ifcProjectNode, child);
  })
}

function nodeToString(node) {
  return `${node.type} - ${node.expressID}`
}

function constructTreeMenuNode(parent, node) {
  const children = node.children;
  if (children.length === 0) {
      createSimpleChild(parent, node);
      return;
  }
  const nodeElement = createNestedChild(parent, node);
  children.forEach(child => {
      constructTreeMenuNode(nodeElement, child);
  })
}

function createNestedChild(parent, node) {
  const content = nodeToString(node);
  const root = document.createElement('li');
  createTitle(root, content);
  const childrenContainer = document.createElement('ul');
  childrenContainer.classList.add("nested");
  root.appendChild(childrenContainer);
  parent.appendChild(root);
  return childrenContainer;
}

function createTitle(parent, content) {
  const title = document.createElement("span");
  title.classList.add("caret");
  title.onclick = () => {
      title.parentElement.querySelector(".nested").classList.toggle("active");
      title.classList.toggle("caret-down");
  }
  title.textContent = content;
  parent.appendChild(title);
}

function createSimpleChild(parent, node) {
  const content = nodeToString(node);
  const childNode = document.createElement('li');
  childNode.classList.add('leaf-node');
  childNode.textContent = content;
  parent.appendChild(childNode);

  childNode.onmouseenter = () => {
      viewer.IFC.selector.prepickIfcItemsByID(0, [node.expressID]);
  }

  childNode.onclick = async () => {
      viewer.IFC.selector.pickIfcItemsByID(0, [node.expressID]);
  }
}

function removeAllChildren(element) {
  while (element.firstChild) {
      element.removeChild(element.firstChild);
  }
}