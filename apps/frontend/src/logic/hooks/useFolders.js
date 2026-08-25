import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import {
  createFolderAPI,
  deleteFolderAPI,
  getAllFoldersAPI,
  moveEntitiesToFolderAPI,
  updateFolderAPI,
} from "../../data/apis/folder";

export const useFolders = (tenantID, entityType) => {
  const {
    data: folders,
    isLoading: isLoadingFolders,
    error: loadFoldersError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.FOLDERS(tenantID, entityType)],
    queryFn: () => getAllFoldersAPI({ tenantID, entityType }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID) && Boolean(entityType),
  });

  return { folders: folders || [], isLoadingFolders, loadFoldersError };
};

/** Shared mutations for folder CRUD + entity moves. Invalidates the right keys. */
export const useFolderActions = ({ tenantID, entityType }) => {
  const queryClient = useQueryClient();

  const _invalidateFolders = () =>
    queryClient.invalidateQueries({
      queryKey: [CONSTANTS.REACT_QUERY_KEYS.FOLDERS(tenantID, entityType)],
    });

  const invalidateEntityQueries = () => {
    const keyByType = {
      widget: CONSTANTS.REACT_QUERY_KEYS.WIDGETS,
      workflow: CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS,
      dataQuery: CONSTANTS.REACT_QUERY_KEYS.QUERIES,
      cronJob: CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS,
      appPage: CONSTANTS.REACT_QUERY_KEYS.APP_PAGES,
    };
    const keyFn = keyByType[entityType];
    if (keyFn) queryClient.invalidateQueries({ queryKey: [keyFn(tenantID)] });
  };

  const createFolder = useMutation({
    mutationFn: ({ folderTitle, parentFolderID }) =>
      createFolderAPI({ tenantID, entityType, folderTitle, parentFolderID }),
    onSuccess: _invalidateFolders,
    retry: false,
  });

  const renameFolder = useMutation({
    mutationFn: ({ folderID, folderTitle }) =>
      updateFolderAPI({ tenantID, folderID, folderTitle }),
    onSuccess: _invalidateFolders,
    retry: false,
  });

  const moveFolder = useMutation({
    mutationFn: ({ folderID, parentFolderID }) =>
      updateFolderAPI({ tenantID, folderID, parentFolderID }),
    onSuccess: _invalidateFolders,
    retry: false,
  });

  const deleteFolder = useMutation({
    mutationFn: ({ folderID }) => deleteFolderAPI({ tenantID, folderID }),
    onSuccess: () => {
      _invalidateFolders();
      invalidateEntityQueries();
    },
    retry: false,
  });

  const moveEntities = useMutation({
    mutationFn: ({ entityIDs, folderID }) =>
      moveEntitiesToFolderAPI({ tenantID, entityType, entityIDs, folderID }),
    onSuccess: () => {
      invalidateEntityQueries();
    },
    retry: false,
  });

  return { createFolder, renameFolder, moveFolder, deleteFolder, moveEntities };
};
