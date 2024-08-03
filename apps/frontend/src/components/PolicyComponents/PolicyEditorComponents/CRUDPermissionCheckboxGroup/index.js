import { Checkbox, Grid } from "@mui/material";

export const CRUDPermissionCheckboxGroup = ({
  label,
  value,
  handleChange,
  permissionKeys,
}) => {
  const _handleChange = (_value, checked) => {
    handleChange({ ...value, [_value]: checked });
  };

  const _permissionKeys = permissionKeys
    ? permissionKeys
    : Object.keys({
        add: false,
        edit: false,
        delete: false,
        read: false,
        ...value,
      });
  return (
    <Grid container>
      {label && (
        <Grid
          item
          xs={4}
          sm={4}
          md={4}
          lg={4}
          xl={4}
          className="!flex !justify-start !items-center"
        >
          {label}
        </Grid>
      )}
      {_permissionKeys?.map((_value) => {
        return (
          <Grid
            item
            xs={2}
            sm={2}
            md={2}
            lg={2}
            xl={2}
            className="!flex !justify-start !items-center !flex-row"
          >
            <label className="!capitalize">{_value}</label>
            <Checkbox
              checked={Boolean(value[_value])}
              onChange={(e) => {
                _handleChange(_value, e.target.checked);
              }}
              inputProps={{ "aria-label": "controlled" }}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};
