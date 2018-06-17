import Dexie from 'dexie';

export class Database extends Dexie {
  constructor() {
    super('library');

    this.version(1).stores({
      files: '++id,&path',
      tracks: '++id,file,album',
      albums: '++id,artist,[artist+title+releaseDate+discNumber+discTitle]',
    });
  }
}
