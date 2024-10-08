import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";

import { getAllTables } from "../../../api/tables";
import { addTriggerAPI } from "../../../api/triggers";
import { LOCAL_CONSTANTS } from "../../../constants";
import {
  TRIGGER_EVENT,
  TRIGGER_FIRE_METHOD,
  TRIGGER_IMPACT_TIMING,
} from "../../../utils/editorAutocomplete/pgKeywords";
import { displayError, displaySuccess } from "../../../utils/notification";
import theme from "../../../theme";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const TriggerAdditionForm = () => {
  const queryClient = useQueryClient();

  const {
    isLoading: isLoadingTables,
    data: tables,
    error: loadTablesError,
    refetch: refetchTables,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLES],
    queryFn: () => getAllTables(),
    cacheTime: 0,
    retry: 1,
    staleTime: 0,
  });

  const {
    isPending: isAddingTrigger,
    isSuccess: isAddingTriggerSuccess,
    isError: isAddingTriggerError,
    error: addTriggerError,
    mutate: addTrigger,
  } = useMutation({
    mutationFn: (data) => {
      return addTriggerAPI({
        data: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.TRIGGER_ADDITION_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.TRIGGERS,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const triggerBuilderForm = useFormik({
    initialValues: {
      pm_trigger_name: "",
      pm_trigger_table_name: "",
      pm_trigger_timing: TRIGGER_IMPACT_TIMING.AFTER,
      pm_trigger_events: [TRIGGER_EVENT.UPDATE],
      pm_trigger_method: TRIGGER_FIRE_METHOD.FOR_EACH_STATEMENT,
      pm_trigger_condition: "",
      pm_trigger_channel_name: "",
    },
    onSubmit: (values) => {
      addTrigger(values);
    },
    validate: (values) => {
      const errors = {};
      if (String(values.pm_trigger_name).trim() == "") {
        errors.pm_trigger_name = "Required";
      }
      if (String(values.pm_trigger_table_name).trim() == "") {
        errors.pm_trigger_table_name = "Required";
      }
      if (String(values.pm_trigger_timing).trim() == "") {
        errors.pm_trigger_timing = "Required";
      }
      if (String(values.pm_trigger_events).trim() == "") {
        errors.pm_trigger_events = "Required";
      }
      if (String(values.pm_trigger_method).trim() == "") {
        errors.pm_trigger_method = "Required";
      }
      if (String(values.pm_trigger_channel_name).trim() == "") {
        errors.pm_trigger_channel_name = "Required";
      }
      return errors;
    },
  });

  return (
    <div className="w-full !h-[calc(100vh-100px)]">
      <div
        className="flex flex-col items-start justify-start p-3 px-6"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start mt-1">
          {LOCAL_CONSTANTS.STRINGS.TRIGGER_ADDITION_PAGE_TITLE}
        </span>
      </div>
      <Grid container>
        <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
          <form
            className="!flex !flex-col justify-start items-stretch w-full p-3"
            onSubmit={triggerBuilderForm.handleSubmit}
          >
            <FormControl fullWidth size="small" className="!mt-3">
              <span className="text-xs font-light  !capitalize mb-1">{`Name`}</span>
              <TextField
                required={true}
                fullWidth
                size="small"
                variant="outlined"
                type="text"
                name={"pm_trigger_name"}
                value={triggerBuilderForm.values.pm_trigger_name}
                onChange={triggerBuilderForm.handleChange}
                onBlur={triggerBuilderForm.handleBlur}
                error={triggerBuilderForm.errors.pm_trigger_name}
              />
              {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
            </FormControl>
            <FormControl fullWidth size="small" className="!mt-3">
              <span className="text-xs font-light  !capitalize mb-1">{`Table name`}</span>
              <Select
                required={true}
                fullWidth
                size="small"
                variant="outlined"
                type="text"
                name={"pm_trigger_table_name"}
                value={triggerBuilderForm.values.pm_trigger_table_name}
                onChange={triggerBuilderForm.handleChange}
                onBlur={triggerBuilderForm.handleBlur}
                error={triggerBuilderForm.errors.pm_trigger_table_name}
              >
                {tables?.map((table) => {
                  return <MenuItem value={table}>{table}</MenuItem>;
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" className="!mt-3">
              <span className="text-xs font-light  !capitalize mb-1">{`Trigger timing`}</span>
              <Select
                required={true}
                fullWidth
                size="small"
                variant="outlined"
                type="text"
                name={"pm_trigger_timing"}
                value={triggerBuilderForm.values.pm_trigger_timing}
                onChange={triggerBuilderForm.handleChange}
                onBlur={triggerBuilderForm.handleBlur}
                error={triggerBuilderForm.errors.pm_trigger_timing}
              >
                {Object.keys(TRIGGER_IMPACT_TIMING).map((key) => {
                  return (
                    <MenuItem value={TRIGGER_IMPACT_TIMING[key]}>
                      {TRIGGER_IMPACT_TIMING[key]}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" className="!mt-3">
              <span className="text-xs font-light  !capitalize mb-1">{`Trigger events`}</span>
              <Select
                id={"pm_trigger_events"}
                multiple
                value={triggerBuilderForm.values.pm_trigger_events}
                onChange={triggerBuilderForm.handleChange}
                onBlur={triggerBuilderForm.handleBlur}
                name="pm_trigger_events"
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                error={triggerBuilderForm.errors.pm_trigger_events}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        className="!rounded"
                        size="small"
                        key={value}
                        label={value}
                      />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {Object.keys(TRIGGER_EVENT).map((key) => (
                  <MenuItem
                    key={key}
                    value={TRIGGER_EVENT[key]}
                    // style={getStyles(name, personName, theme)}
                  >
                    {TRIGGER_EVENT[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" className="!mt-3">
              <span className="text-xs font-light  !capitalize mb-1">{`Trigger method`}</span>
              <Select
                required={true}
                fullWidth
                size="small"
                variant="outlined"
                type="text"
                name={"pm_trigger_method"}
                value={triggerBuilderForm.values.pm_trigger_method}
                onChange={triggerBuilderForm.handleChange}
                onBlur={triggerBuilderForm.handleBlur}
                error={triggerBuilderForm.errors.pm_trigger_method}
              >
                {Object.keys(TRIGGER_FIRE_METHOD).map((key) => {
                  return (
                    <MenuItem value={TRIGGER_FIRE_METHOD[key]}>
                      {TRIGGER_FIRE_METHOD[key]}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" className="!mt-3">
              <span className="text-xs font-light  !capitalize mb-1">{`Trigger condition`}</span>
              <TextField
                required={false}
                fullWidth
                size="small"
                variant="outlined"
                type="text"
                name={"pm_trigger_condition"}
                value={triggerBuilderForm.values.pm_trigger_condition}
                onChange={triggerBuilderForm.handleChange}
                onBlur={triggerBuilderForm.handleBlur}
                error={triggerBuilderForm.errors.pm_trigger_condition}
              />
              {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
            </FormControl>
            <FormControl fullWidth size="small" className="!mt-3">
              <span className="text-xs font-light  !capitalize mb-1">{`Notification channel`}</span>
              <TextField
                required={true}
                fullWidth
                size="small"
                variant="outlined"
                type="text"
                name={"pm_trigger_channel_name"}
                value={triggerBuilderForm.values.pm_trigger_channel_name}
                onChange={triggerBuilderForm.handleChange}
                onBlur={triggerBuilderForm.handleBlur}
                error={triggerBuilderForm.errors.pm_trigger_channel_name}
              />
              {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
            </FormControl>
            <div className="flex flex-row items-center justify-end w-full mt-10">
              <Button
                disableElevation
                variant="contained"
                size="small"
                type="submit"
                className="!ml-2"
                onClick={triggerBuilderForm.submitForm}
              >
                {LOCAL_CONSTANTS.STRINGS.ADD_BUTTON_TEXT}
              </Button>
            </div>
          </form>
        </Grid>
        <Grid item xl={6} lg={6} md={0} sm={0} xs={0} className="!p-3"></Grid>
      </Grid>
    </div>
  );
};

export default TriggerAdditionForm;
