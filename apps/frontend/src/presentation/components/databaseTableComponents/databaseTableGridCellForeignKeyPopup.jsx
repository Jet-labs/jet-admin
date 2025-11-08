import { useState } from "react";
import { Popover } from "@mui/material";
import { CONSTANTS } from "../../../constants";
import { PostgreSQLUtils } from "../../../utils/postgre";
import { Link } from "react-router-dom";
import { BiLink } from "react-icons/bi";
import { AiOutlineEye } from "react-icons/ai"; // Eye icon
import { DatabaseTableGrid } from "./databaseTableGrid";

export const DatabaseTableGridCellForeignKeyPopup = ({
    tenantID,
    databaseSchemaName,
    foreignKeyReference,
    cellValue,
    type,
}) => {
    const uniqueKey = `databaseTableGridCellForeignKeyPopup_${tenantID}_${databaseSchemaName}_${foreignKeyReference?.[0]?.referencedTable}`;
    const [anchorEl, setAnchorEl] = useState(null);

    const _handleOpenPopup = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const _handleClosePopup = () => {
        setAnchorEl(null);
    };

    const isPopupOpen = Boolean(anchorEl);

    const foreignKeyReferenceLink = () => {
        return `${CONSTANTS.ROUTES.VIEW_DATABASE_TABLE_BY_NAME.path(
            tenantID,
            databaseSchemaName,
            foreignKeyReference?.[0]?.referencedTable
        )}?filterQuery=${encodeURIComponent(
            JSON.stringify([
                {
                    field: foreignKeyReference?.[0]?.referencedColumns[0],
                    operator: "=",
                    value: PostgreSQLUtils.processFilterValueAccordingToFieldType({
                        type: CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].js_type,
                        value: cellValue,
                    }),
                    fieldType: type,
                },
            ])
        )}`;
    };

    return (
        <div className="flex flex-row justify-between items-center w-full gap-2">
            <Link
                key={`foreignKeyIndicator_${uniqueKey}`}
                to={foreignKeyReferenceLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100 p-1.5 rounded cursor-pointer hover:bg-slate-200"
            >
                <BiLink size={14} />
            </Link>

            <button
                onClick={_handleOpenPopup}
                className="bg-slate-100 p-1.5 me-2 rounded cursor-pointer hover:bg-slate-200"
                aria-haspopup="true"
                aria-expanded={isPopupOpen}
            >
                <AiOutlineEye size={14} />
            </button>

            <Popover
                id={`popover-${uniqueKey}`}
                open={isPopupOpen}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                onClose={_handleClosePopup}
                disableRestoreFocus
            >
                <div className="p-2 w-96">
                    <DatabaseTableGrid
                        tenantID={tenantID}
                        databaseSchemaName={databaseSchemaName}
                        databaseTableName={foreignKeyReference?.[0]?.referencedTable}
                        initialFilterQuery={[
                            {
                                field: foreignKeyReference?.[0]?.referencedColumns[0],
                                operator: "=",
                                value: PostgreSQLUtils.processFilterValueAccordingToFieldType({
                                    type: CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].js_type,
                                    value: cellValue,
                                }),
                                fieldType: type,
                            },
                        ]}
                        showStats={false}
                        containerClass="!max-h-96 !overflow-y-auto"
                        visiblyShowPagination={false}
                        visiblyShowFilters={false}
                    />
                </div>
            </Popover>
        </div>
    );
};