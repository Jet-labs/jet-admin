import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { FaHistory } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getAllJobAPI } from "../../../api/jobs";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../contexts/authContext";
import { FaChalkboardTeacher, FaPlus, FaRedo } from "react-icons/fa";

export const JobsList = () => {
  const theme = useTheme();
  const routeParam = useParams();
  const currentPage = `job_${routeParam?.["*"]}`;
  const { pmUser } = useAuthState();
  const navigate = useNavigate();
  const isAuthorizedToAddJob = useMemo(() => {
    return pmUser && pmUser.isAuthorizedToAddJob();
  }, [pmUser]);
  const {
    isLoading: isLoadingJobs,
    data: jobs,
    error: loadJobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: [`REACT_QUERY_KEY_JOBS`],
    queryFn: () => getAllJobAPI(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const _navigateToAddMoreJob = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.ADD_JOB.path());
  };
  const _navigateToJobHistory = () => {
    navigate(LOCAL_CONSTANTS.ROUTES.JOB_HISTORY.path());
  };
  return (
    <List
      style={{
        borderRightWidth: 1,
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.background.default,
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      className=" !h-[calc(100vh-48px)] !overflow-y-auto !overflow-x-hidden w-full"
    >
      <div className="!px-3.5 py-1 flex flex-row justify-between items-center w-full">
        <span
          className="!font-semibold"
          style={{ color: theme.palette.primary.main }}
        >
          {"Jobs"}
        </span>
        <IconButton onClick={refetchJobs}>
          <FaRedo
            style={{ color: theme.palette.primary.main }}
            className="!text-sm"
          />
        </IconButton>
      </div>
      {isAuthorizedToAddJob && (
        <div className="!px-3 !py-1.5 !w-full">
          <Button
            onClick={_navigateToAddMoreJob}
            variant="contained"
            className="!w-full"
            startIcon={<FaPlus className="!text-sm" />}
          >
            Add more jobs
          </Button>
          <Button
            onClick={_navigateToJobHistory}
            variant="outlined"
            className="!w-full  !mt-3"
            startIcon={<FaHistory className="!text-sm" />}
          >
            View job history
          </Button>
        </div>
      )}
      <div className="!mt-1"></div>
      {jobs && jobs.length > 0
        ? jobs.map((job) => {
            const key = `job_${job.pm_job_id}`;
            return (
              <Link
                to={LOCAL_CONSTANTS.ROUTES.GRAPH_VIEW.path(job.pm_job_id)}
                key={key}
              >
                <ListItem
                  key={`_job_${job.pm_job_id}`}
                  disablePadding
                  className="!px-3 !py-1.5"
                >
                  <ListItemButton
                    sx={{
                      background: theme.palette.background.paper,
                      border: key == currentPage ? 1 : 0,
                      borderColor: theme.palette.primary.main,
                    }}
                    selected={key == currentPage}
                    className="!rounded"
                  >
                    <ListItemIcon
                      className="!ml-1"
                      sx={{
                        color:
                          key == currentPage
                            ? theme.palette.primary.main
                            : theme.palette.primary.contrastText,
                        minWidth: 0,
                      }}
                    >
                      <FaChalkboardTeacher className="!text-sm" />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color:
                          key == currentPage
                            ? theme.palette.primary.main
                            : theme.palette.primary.contrastText,
                      }}
                      primary={job.pm_job_title}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: key == currentPage ? "700" : "500",
                          fontSize: 12,
                          marginLeft: 2,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {/* <Divider className="!mx-4" /> */}
              </Link>
            );
          })
        : null}
    </List>
  );
};
