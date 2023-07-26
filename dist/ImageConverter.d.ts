import JSZip from 'jszip';
import { WebTwain } from 'dwt/dist/types/WebTwain';
export interface Config {
    license?: string;
    container?: HTMLDivElement;
}
export declare enum ImageFormat {
    JPG = 0,
    PNG = 1,
    PDF = 2,
    TIFF = 3
}
export interface ConvertedFile {
    filename: string;
    blob: Blob;
}
export declare class ImageConverter {
    private container;
    private filesSelected;
    private DWObject;
    private fileInput;
    private useZipCheckbox;
    private files;
    private convertActions;
    private formatSelect;
    private convertButton;
    private chooseFilesButton;
    constructor(config?: Config);
    convert(file: File, targetFormat: ImageFormat): Promise<ConvertedFile[]>;
    getDWObject(): WebTwain;
    createElements(): void;
    initDWT(): void;
    DynamsoftButton(text: string): HTMLAnchorElement;
    appendFiles(): Promise<void>;
    listFiles(): void;
    fileItem(file: File): HTMLDivElement;
    deleteSelected(file: File): void;
    useEllipsesForLongText(text: string): string;
    convertAndDownload(): Promise<void>;
    loadImageFromFile(file: File): Promise<void>;
    save(file: File, zip: JSZip | undefined): Promise<void>;
    saveImages(file: File): Promise<void>;
    appendImagesToZip(file: File, zip: JSZip): Promise<void>;
    getImageIndices(): number[];
    downloadBlob(content: Blob, filename: string): void;
    getBlob(indices: number[], type: number): Promise<Blob>;
    getFileNameWithoutExtension(filename: string): string;
    loadImagesFromZip(zipFile: File): Promise<void>;
}
