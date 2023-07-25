import styles from './style.module.css'

let filesSelected:File[] = [];
let container = document.querySelector<HTMLDivElement>('#app');
let files = document.createElement("div");
let actionsContainer = document.createElement("div");
actionsContainer.className = styles.actions;
let chooseFilesContainer = document.createElement("div");
let fileInput = document.createElement("input");
fileInput.style.display = "none";
fileInput.multiple = true;
fileInput.accept = ".bmp,.jpeg,.jpg,.png,.pdf,.tiff,.tif";
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
let convertButton = DynamsoftButton("Convert");
convertButton.style.marginLeft = "10px";
convertButton.addEventListener("click",function(){
  convertAndDownload();
})
convertActions.appendChild(formatSelector);
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
  for (let index = 0; index < filesSelected.length; index++) {
    const file = filesSelected[index];
    DWObject.RemoveAllImages();
    await loadImageFromFile(file);
    await save(file);
  }
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

async function save(file:File){
  if (DWObject.HowManyImagesInBuffer > 1) {
    await saveMultipleImage(file);
  }else{
    await saveSingleImage(file);
  }
}

async function saveSingleImage(file:File){
  let selectedFormatIndex = formatSelect.selectedIndex;
  //"JPG","PNG","PDF","TIFF"
  if (selectedFormatIndex === 0) {
    let blob = await getBlob([0],Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG);
    downloadBlob(blob,getFileNameWithoutExtension(file.name)+".jpg");
  }else if (selectedFormatIndex === 1) {
    let blob = await getBlob([0],Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG);
    downloadBlob(blob,getFileNameWithoutExtension(file.name)+".png");
  }else if (selectedFormatIndex === 2) {
    let blob = await getBlob([0],Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF);
    downloadBlob(blob,getFileNameWithoutExtension(file.name)+".pdf");
  }else if (selectedFormatIndex === 3) {
    let blob = await getBlob([0],Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF);
    downloadBlob(blob,getFileNameWithoutExtension(file.name)+".tiff");
  }
}

async function saveMultipleImage(file:File){
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
  console.log(fileType);
  console.log(extension);
  if (selectedFormatIndex > 1) {
    let blob = await getBlob(getImageIndices(),fileType);
    downloadBlob(blob,getFileNameWithoutExtension(file.name)+extension);
  }else{
    for (let index = 0; index < DWObject.HowManyImagesInBuffer; index++) {
      let blob = await getBlob([index],fileType);
      downloadBlob(blob,getFileNameWithoutExtension(file.name)+"-"+index+extension);
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

