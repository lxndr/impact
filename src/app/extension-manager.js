import globby from 'globby';

export class ExtensionManager {
  extensions = []

  async init() {
    const directories = await globby('./src/exts', {onlyDirectories: true});

    for (const directory of directories) {
    }
  }
}
