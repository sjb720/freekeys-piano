import { useEffect, useState } from 'react';

export function useFolders() {
  const [folders, setFolders] = useState<string[] | null>(null);
  useEffect(() => {
    let live = true;
    void window.api.library.folders().then((value) => live && setFolders(value));
    return () => {
      live = false;
    };
  }, []);
  return {
    folders,
    add: () => window.api.library.addFolder().then(setFolders),
    remove: (folder: string) => window.api.library.removeFolder(folder).then(setFolders),
  };
}
