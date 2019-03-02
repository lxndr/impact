import EventEmitter from 'events';

export type Id = string;

interface BaseFile {
  type: string;
  path: string;
  mtime: Date;
  size: number;
  hash: string | null;
}

export interface InspectFile extends BaseFile {
  _id?: Id;
}

export interface File extends BaseFile {
  _id: Id;
}

export type DbFile = File;

interface BaseImage {
  mimeType?: string;
}

export interface InspectImage extends BaseImage {
  blob?: Buffer;
  path?: string;
}

export interface Image extends BaseImage {
  _id: Id;
  path: string;
}

export type DbImage = Image;

interface BaseTrack {
  number?: number;
  title?: string;
  genre?: string;
  duration: number;
  nChannels: number;
  sampleRate: number;
};

export interface InspectTrack extends BaseTrack {
  artists?: string[];
  images?: InspectImage[];
  offset?: number;
  file: InspectFile;
  index?: InspectFile;
}

interface GenericTrack<ALBUM, IMAGE, FILE> extends BaseTrack {
  _id: Id;
  artists: string[];
  album: ALBUM;
  offset: number;
  images: IMAGE[];
  file: FILE;
}

export type Track = GenericTrack<Album, Image, Id>;

export interface DbTrack extends GenericTrack<Id, Id, Id> {
  index: Id | null;
}

export type PlaybackTrack = GenericTrack<DbAlbum, DbImage, DbFile>;

export interface Disc {
  _id: Id;
  number: number;
  title: string | null;
  duration: number;
  images: Image[];
  tracks: Track[];
}

export interface InspectAlbum {
  title?: string;
  artist?: string;
  originalDate?: string;
  releaseDate?: string;
  releaseType?: string;
  edition?: string;
  label?: string;
  catalogId?: string;
  discNumber?: number;
  discTitle?: string;
  images?: InspectImage[];
  tracks: InspectTrack[];
}

interface BaseAlbum {
  _id: Id;
  title: string | null;
  artist: string | null;
  originalDate: string | null;
  releaseDate: string | null;
  releaseType: string | null;
  edition: string | null;
  label: string | null;
  catalogId: string | null;
}

export interface DbAlbum extends BaseAlbum {
  discNumber: number;
  discTitle: string | null;
  images: Id[];
}

export interface Album extends BaseAlbum {
  duration: number;
  discs: Disc[];
}

export abstract class Player extends EventEmitter {
  public abstract get uri(): string | null;
  public abstract set uri(file: string | null);
  public abstract get duration(): number;
  public abstract get position(): number;
  public abstract set position(seconds: number);
  public abstract get state(): string;
  public abstract play(): void;
  public abstract pause(): void;
  public abstract stop(): void;
  public abstract close(): void;
}

export type FileHandlerResult = InspectAlbum[];

export type FileHandlerOptions = {
  file: InspectFile,
  scanner: {
    inspect: (filename: string) => Promise<FileHandlerResult>,
  },
};

export type FileHandler = (options: FileHandlerOptions) => Promise<FileHandlerResult>;
