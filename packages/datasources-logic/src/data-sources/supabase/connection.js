import { createClient } from "@supabase/supabase-js";
import { Logger } from "../../utils/logger.js";

export const supabaseTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "supabase:supabaseTestConnection:params",
      params: { projectUrl: datasourceOptions.projectUrl },
    });

    const supabase = createClient(
      datasourceOptions.projectUrl,
      datasourceOptions.serviceRoleKey || datasourceOptions.anonKey
    );

    // Test connection by getting the authenticated user or a simple query
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message !== "Auth session missing!") {
      throw error;
    }

    Logger.log("info", {
      message: "supabase:supabaseTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "supabase:supabaseTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
