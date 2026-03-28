import { useState } from "react";
import { CONSTANTS } from "../../../constants";
import { PostgreSQLUtils } from "../../../utils/postgre";
import { Link } from "react-router-dom";
import { BiLink } from "react-icons/bi";
import { AiOutlineEye } from "react-icons/ai";
import { DatabaseTableGrid } from "./databaseTableGrid";

import { Button, Popover, PopoverContent, PopoverTrigger } from "@jet-admin/ui";
export const DatabaseTableGridCellForeignKeyPopup = ({
    tenantID,
    databaseSchemaName,
    foreignKeyReference,
    cellValue,
    type,
}) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

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
                key={`foreignKeyIndicator_${cellValue}`}
                to={foreignKeyReferenceLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-100 p-1.5 rounded cursor-pointer hover:bg-slate-200 text-slate-600 transition-colors"
            >
                <BiLink size={14} />
            </Link>

            <Popover open={isPopupOpen} onOpenChange={setIsPopupOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        square
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-100 p-1.5 me-2 rounded cursor-pointer hover:bg-slate-200 h-7 w-7 text-slate-600 border-0 outline-none hover:text-slate-800"
                        aria-haspopup="true"
                        aria-expanded={isPopupOpen}
                    >
                        <AiOutlineEye size={14} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    align="end" 
                    className="w-96 p-2"
                    onInteractOutside={(e) => {
                        // Prevent the popover from immediately closing if user interacts with portals
                        // inside the nested DataGrid (like slider/menus/selects)
                        e.preventDefault();
                    }}
                >
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
                        containerClass="max-h-96 overflow-y-auto"
                        visiblyShowPagination={false}
                        visiblyShowFilters={false}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};