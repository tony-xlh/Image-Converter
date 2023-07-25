import styles from './style.module.css';
import JSZip from 'jszip';

let filesSelected:File[] = [];
let container = document.querySelector<HTMLDivElement>('#app');
let files = document.createElement("div");
let actionsContainer = document.createElement("div");
actionsContainer.className = styles.actions;
let chooseFilesContainer = document.createElement("div");
let fileInput = document.createElement("input");
fileInput.style.display = "none";
fileInput.multiple = true;
fileInput.accept = ".bmp,.jpeg,.jpg,.png,.pdf,.tiff,.tif,.zip";
fileInput.type = "file";
fileInput.addEventListener("change",async function(){
  chooseFilesButton.innerText = "Loading...";
  await appendFiles();
  listFiles();
  chooseFilesButton.innerText = "Choose Files";
})
let chooseFilesButton = DynamsoftButton("Choose Files");
chooseFilesButton.addEventListener("click",function(){
  fileInput.click();
});
chooseFilesContainer.appendChild(fileInput);
chooseFilesContainer.appendChild(chooseFilesButton);
actionsContainer.appendChild(chooseFilesContainer);
let convertActions = document.createElement("div");
convertActions.className = styles.convertActions;
convertActions.style.display = "none";
let formatSelector = document.createElement("label");
formatSelector.innerText = "To:"
let formatSelect = document.createElement("select");
for (const format of ["JPG","PNG","PDF","TIFF"]) {
  formatSelect.options.add(new Option(format,format));
}
formatSelector.appendChild(formatSelect);
let useZip = document.createElement("label");
useZip.innerText = "Download as Zip:"
useZip.style.marginLeft = "10px";
let useZipCheckbox = document.createElement("input");
useZipCheckbox.type = "checkbox";
useZip.appendChild(useZipCheckbox);
let convertButton = DynamsoftButton("Convert");
convertButton.style.marginLeft = "10px";
convertButton.addEventListener("click",function(){
  convertAndDownload();
})
convertActions.appendChild(formatSelector);
convertActions.appendChild(useZip);
convertActions.appendChild(convertButton);
actionsContainer.appendChild(convertActions);
container!.appendChild(files);
container!.appendChild(actionsContainer);

let DWObject:any;
let Dynamsoft = (window as any)["Dynamsoft"];
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
    function(obj:any) {
      console.log(obj);
      DWObject = obj;
    },
    function(err:string) {
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

async function appendFiles(){
  if (fileInput.files) {
    for (let index = 0; index < fileInput.files.length; index++) {
      let file = fileInput.files[index];
      if (file.name.endsWith(".zip")) {
        useZipCheckbox.checked = true;
        await loadImagesFromZip(file);
      }else{
        filesSelected.push(file);
      }
      
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
  if (filesSelected.length > 0) {
    convertActions.style.display = "";
  }else{
    convertActions.style.display = "none";
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

async function convertAndDownload(){
  convertButton.innerText = "Converting...";
  let zip:JSZip|undefined;
  if (useZipCheckbox.checked) {
    zip = new JSZip();
  }
  for (let index = 0; index < filesSelected.length; index++) {
    const file = filesSelected[index];
    DWObject.RemoveAllImages();
    await loadImageFromFile(file);
    await save(file,zip);
  }
  if (useZipCheckbox.checked && zip) {
    zip.generateAsync({type:"blob"}).then(function(content) {
      downloadBlob(content,"images.zip");
    });
  }
  convertButton.innerText = "Convert";
}

async function loadImageFromFile(file:File){
  return new Promise<void>((resolve, reject) => {
    DWObject.LoadImageFromBinary(file,
      function(){
        resolve();
      },
      function(_errorCode: number, errorString: string){
        reject(errorString);
      }
    )
  })
}

async function save(file:File,zip:JSZip|undefined){
  if (useZipCheckbox.checked === false) {
    await saveImages(file);
  }else{
    if (zip) {
      await appendImagesToZip(file,zip);
    }
  }
}

async function saveImages(file:File){
  let selectedFormatIndex = formatSelect.selectedIndex;
  //"JPG","PNG","PDF","TIFF"
  let fileType = 7;
  let extension = "";
  if (selectedFormatIndex === 0) {
    fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG;
    extension = ".jpg";
  }else if (selectedFormatIndex === 1) {
    fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG;
    extension = ".png";
  }else if (selectedFormatIndex === 2) {
    fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF;
    extension = ".pdf";
  }else if (selectedFormatIndex === 3) {
    fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF;
    extension = ".tiff";
  }
  if (selectedFormatIndex > 1) {
    let blob = await getBlob(getImageIndices(),fileType);
    downloadBlob(blob,getFileNameWithoutExtension(file.name)+extension);
  }else{
    if (DWObject.HowManyImagesInBuffer > 1) {
      for (let index = 0; index < DWObject.HowManyImagesInBuffer; index++) {
        let blob = await getBlob([index],fileType);
        downloadBlob(blob,getFileNameWithoutExtension(file.name)+"-"+index+extension);
      }
    }else{
      let blob = await getBlob([0],fileType);
      downloadBlob(blob,getFileNameWithoutExtension(file.name)+extension);
    }
  }
}

async function appendImagesToZip(file:File,zip:JSZip){
  let selectedFormatIndex = formatSelect.selectedIndex;
  //"JPG","PNG","PDF","TIFF"
  let fileType = 7;
  let extension = "";
  if (selectedFormatIndex === 0) {
    fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG;
    extension = ".jpg";
  }else if (selectedFormatIndex === 1) {
    fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG;
    extension = ".png";
  }else if (selectedFormatIndex === 2) {
    fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF;
    extension = ".pdf";
  }else if (selectedFormatIndex === 3) {
    fileType = Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF;
    extension = ".tiff";
  }
  if (selectedFormatIndex > 1) {
    let blob = await getBlob(getImageIndices(),fileType);
    zip.file(getFileNameWithoutExtension(file.name)+extension, blob);
  }else{
    if (DWObject.HowManyImagesInBuffer > 1) {
      for (let index = 0; index < DWObject.HowManyImagesInBuffer; index++) {
        let blob = await getBlob([index],fileType);
        zip.file(getFileNameWithoutExtension(file.name)+"-"+index+extension, blob);
      }
    }else{
      let blob = await getBlob([0],fileType);
      zip.file(getFileNameWithoutExtension(file.name)+extension, blob);
    }
  }
}

function getImageIndices(){
  let indices = [];
  for (let index = 0; index < DWObject.HowManyImagesInBuffer; index++) {
    indices.push(index);
  }
  return indices;
}

function downloadBlob(content:Blob,filename:string){
  const link = document.createElement('a')
  link.href = URL.createObjectURL(content);
  link.download = filename;
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function getBlob(indices:number[],type:number){
  return new Promise<Blob>((resolve, reject) => {
    DWObject.ConvertToBlob(indices,type,
      function(blob:Blob){
        resolve(blob);
      },
      function(_errorCode: number, errorString: string){
        reject(errorString);
      }
    )  
  })
  
}

/*
* eg. filename.jpg -> filename
*/
function getFileNameWithoutExtension(filename:string){
  if (filename.lastIndexOf(".") != -1) {
    return filename.substring(0,filename.lastIndexOf("."));
  }else{
    return filename;
  }
}

async function loadImagesFromZip(zipFile:File){
  const buffer = await zipFile.arrayBuffer();
  let zip = new JSZip();
  await zip.loadAsync(buffer);
  const files = zip.files;
  const filenames = Object.keys(files);
  for (let index = 0; index < filenames.length; index++) {
    const filename = filenames[index];
    const lowerCase = filename.toLowerCase();
    const file = files[filename];
    if (file.dir === false) {
      if (lowerCase.endsWith(".jpg") || lowerCase.endsWith(".jpeg") || lowerCase.endsWith(".png") || lowerCase.endsWith(".bmp") || lowerCase.endsWith(".pdf") || lowerCase.endsWith(".tif") || lowerCase.endsWith(".tiff")) {
        let blob:Blob = await file.async("blob");
        let imgFile = new File([blob],filename);
        filesSelected.push(imgFile);
      }
    }
  }

}

