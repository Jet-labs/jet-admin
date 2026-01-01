import { createClient } from "@supabase/supabase-js";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class SupabaseDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "supabase:SupabaseDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const {
      queryType,
      table,
      columns,
      filters,
      data,
      functionName,
      functionArgs,
      limit,
      orderBy,
      ascending,
    } = dataQueryOptions;

    const datasourceOptions = this.config.datasourceOptions;
    const supabase = createClient(
      datasourceOptions.projectUrl,
      datasourceOptions.serviceRoleKey || datasourceOptions.anonKey
    );

    try {
      let result;

      switch (queryType) {
        case "select": {
          let query = supabase.from(table).select(columns || "*");

          // Apply filters
          if (filters && Array.isArray(filters)) {
            for (const filter of filters) {
              query = query[filter.operator](filter.column, filter.value);
            }
          }

          // Apply ordering
          if (orderBy) {
            query = query.order(orderBy, { ascending: ascending !== false });
          }

          // Apply limit
          if (limit) {
            query = query.limit(limit);
          }

          const { data: selectData, error } = await query;
          if (error) throw error;
          result = selectData;
          break;
        }

        case "insert": {
          const insertData = typeof data === "string" ? JSON.parse(data) : data;
          const { data: insertedData, error } = await supabase
            .from(table)
            .insert(insertData)
            .select();
          if (error) throw error;
          result = insertedData;
          break;
        }

        case "update": {
          const updateData = typeof data === "string" ? JSON.parse(data) : data;
          let query = supabase.from(table).update(updateData);

          // Apply filters for update
          if (filters && Array.isArray(filters)) {
            for (const filter of filters) {
              query = query[filter.operator](filter.column, filter.value);
            }
          }

          const { data: updatedData, error } = await query.select();
          if (error) throw error;
          result = updatedData;
          break;
        }

        case "delete": {
          let query = supabase.from(table).delete();

          // Apply filters for delete
          if (filters && Array.isArray(filters)) {
            for (const filter of filters) {
              query = query[filter.operator](filter.column, filter.value);
            }
          }

          const { data: deletedData, error } = await query.select();
          if (error) throw error;
          result = deletedData;
          break;
        }

        case "rpc": {
          const args = typeof functionArgs === "string" ? JSON.parse(functionArgs) : functionArgs;
          const { data: rpcData, error } = await supabase.rpc(functionName, args || {});
          if (error) throw error;
          result = rpcData;
          break;
        }

        default:
          throw new Error(`Unsupported query type: ${queryType}`);
      }

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "supabase:SupabaseDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Supabase query failed: ${error.message || error}`);
    }
  }
}
