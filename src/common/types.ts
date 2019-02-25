import { Logger } from 'winston';

export type Id = string;

export enum FileType {
  media = 'media',
  index = 'index',
}

export enum ReleaseType {
  album = 'album',
  single = 'single',
}

interface BaseFile {
  type: FileType;
  path: string;
  mtime: Date;
  size: number;
}

export interface InspectFile extends BaseFile {
  _id?: Id;
}

export interface File extends BaseFile {
  _id: Id;
}

export type DbFile = File;

export interface BaseImage {
  type: number;
  mimeType: string;
}

export interface InspectImage extends BaseImage {
  blob: Buffer;
}

export interface Image extends BaseImage {
  _id: Id;
  path: string;
}

export type DbImage = Image;

export interface BaseTrack<ImageType, FileType> {
  number?: number;
  title?: string;
  artists: string[];
  genre?: string;
  images: ImageType[];
  offset: number;
  duration: number;
  nChannels: number;
  sampleRate: number;
};

export interface InspectTrack extends BaseTrack<InspectImage, InspectFile> {
  file: InspectTrack;
}

export interface Track extends BaseTrack<Image, File> {
  _id: Id;
  file: Id;
}

export type DbTrack = Track;

export interface Disc {
  _id: Id;
  number?: number;
  title?: string;
  duration: number;
  images: Image[];
  tracks: Track[];
}

export interface BaseAlbum {
  artist?: string;
  title?: string;
  originalDate?: string;
  releaseDate?: string;
  releaseType: ReleaseType;
  variant?: string;
}

export interface InspectAlbum extends BaseAlbum {
  discNumber: number;
  discTitle?: string;
  tracks: InspectTrack[];
}

export interface DbAlbum extends BaseAlbum {
  _id: Id;
  discNumber: number;
  discTitle?: string;
  images: Image[];
}

export interface Album extends BaseAlbum {
  _id: Id;
  duration: number;
  discs: Disc[];
}

export interface Player {
  play(): void;
}

export type FileHandlerResult = InspectAlbum[];

export type FileHandlerOptions = {
  file: InspectFile,
  scanner: {
    inspect: (filename: string) => Promise<FileHandlerResult>,
  },
  logger: Logger,
};

export type FileHandler = (options: FileHandlerOptions) => Promise<FileHandlerResult>;
