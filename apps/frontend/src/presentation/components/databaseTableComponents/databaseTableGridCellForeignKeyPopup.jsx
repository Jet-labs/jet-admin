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
                className="bg-slate-100 p-1.5 rounded cursor-pointer hover:bg-slate-200"
            >
                <BiLink size={14} />
            </Link>

            <Popover open={isPopupOpen} onOpenChange={setIsPopupOpen}>
                <PopoverTrigger asChild>
                    <Button
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-100 p-1.5 me-2 rounded cursor-pointer hover:bg-slate-200"
                        aria-haspopup="true"
                        aria-expanded={isPopupOpen}
                    >
                        <AiOutlineEye size={14} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-96 p-2">
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