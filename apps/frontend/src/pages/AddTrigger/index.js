import { useFormik } from "formik";
import { useAppConstants } from "../../contexts/appConstantsContext";
import { LOCAL_CONSTANTS } from "../../constants";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import { useMemo } from "react";
import { ArrayInput } from "../../components/ArrayInputComponent";
import { generateCreateTriggerQuery } from "../../utils/postgresUtils/triggers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTriggerAPI } from "../../api/triggers";
import { displayError, displaySuccess } from "../../utils/notification";
const TRIGGER_IMPACT_TIMING = {
  BEFORE: "BEFORE",
  AFTER: "AFTER",
  INSTEAD_OF: "INSTEAD OF",
};

const TRIGGER_EVENT = {
  INSERT: "INSERT",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  TRUNCATE: "TRUNCATE",
};

const TRIGGER_FIRE_METHOD = {
  FOR_EACH_ROW: "FOR EACH ROW",
  FOR_EACH_STATEMENT: "FOR EACH STATEMENT",
};
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

const AddTrigger = () => {
  const { dbModel } = useAppConstants();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const dbModelFieldMap = useMemo(() => {
    const _map = {};
    if (dbModel) {
      dbModel.forEach((model) => {
        _map[model.name] = model.fields;
      });
    }
    return _map;
  }, [dbModel]);

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
    <div className="flex flex-col justify-start items-center w-full pb-5 p-2">
      <div className=" flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ">
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">
            {LOCAL_CONSTANTS.STRINGS.TRIGGER_ADDITION_PAGE_TITLE}
          </span>
        </div>

        <div className="flex flex-row items-center justify-end w-min ">
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
      </div>
      <form
        className="!flex !flex-col justify-start items-stretch 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full"
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
            {dbModel?.map((model) => {
              return <MenuItem value={model.name}>{model.name}</MenuItem>;
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
                  <Chip size="small" key={value} label={value} />
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
      </form>
    </div>
  );
};

export default AddTrigger;
