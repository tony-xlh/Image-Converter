import Dynamsoft from 'dwt';
import { WebTwain } from 'dwt/dist/types/WebTwain';
import styles from './style.module.css'

let filesSelected:File[] = [];
let container = document.querySelector<HTMLDivElement>('#app');
let files = document.createElement("div");
let actionsContainer = document.createElement("div");
let chooseFilesContainer = document.createElement("div");
let fileInput = document.createElement("input");
fileInput.style.display = "none";
fileInput.multiple = true;
fileInput.accept = ".bmp,.jpg,.png,.pdf,.tiff";
fileInput.type = "file";
fileInput.addEventListener("change",function(){
  appendFiles();
  listFiles();
})
let chooseFilesButton = DynamsoftButton("Choose Files");
chooseFilesButton.addEventListener("click",function(){
  fileInput.click();
});
chooseFilesContainer.appendChild(fileInput);
chooseFilesContainer.appendChild(chooseFilesButton);
actionsContainer.appendChild(chooseFilesContainer);
container!.appendChild(files);
container!.appendChild(actionsContainer);

let DWObject:WebTwain;
initDWT();

function initDWT(){
  Dynamsoft.DWT.AutoLoad = false;
  Dynamsoft.DWT.Containers = [];
  Dynamsoft.DWT.ResourcesPath = "https://unpkg.com/dwt@18.0.2/dist";
  Dynamsoft.DWT.UseLocalService = false;
  Dynamsoft.DWT.CreateDWTObjectEx(
    {
      WebTwainId: 'dwtcontrol'
    },
    function(obj) {
      console.log(obj);
      DWObject = obj;
    },
    function(err) {
      console.log(err);
    }
  );
}

function DynamsoftButton(text:string){
  let anchor = document.createElement("a");
  anchor.innerText = text;
  anchor.className = styles.primaryBtn + " " + styles.textUpperCase;
  return anchor;
}

function appendFiles(){
  if (fileInput.files) {
    for (let index = 0; index < fileInput.files.length; index++) {
      filesSelected.push(fileInput.files[index]);
    }
  }
}

function listFiles(){
  console.log("listFiles");
  console.log(filesSelected);
  files.innerHTML = "";
  for (let index = 0; index < filesSelected.length; index++) {
    const file = filesSelected[index];
    let oneFile = fileItem(file);
    if (index != filesSelected.length - 1) {
      oneFile.style.marginBottom = "10px";
    }
    files.appendChild(oneFile);
  }
}

function fileItem(file:File){
  let container = document.createElement("div");
  container.className = styles.oneFile;
  let title = document.createElement("div");
  title.innerText = useEllipsesForLongText(file.name);
  title.style.width = "30%";
  let fileSize = document.createElement("div");
  fileSize.innerText = file.size/1000 + "kb";
  let deleteButton = DynamsoftButton("Delete");
  deleteButton.addEventListener("click",function(){
    deleteSelected(file);
  })
  container.appendChild(title);
  container.appendChild(fileSize);
  container.appendChild(deleteButton);
  return container;
}

function deleteSelected(file:File){
  let index = filesSelected.indexOf(file);
  filesSelected.splice(index,1);
  listFiles();
}

function useEllipsesForLongText(text:string){
  if (text.length>28){
    text = text.substring(0,14) + "..." + text.substring(text.length-14,text.length);
  }
  return text;
}
