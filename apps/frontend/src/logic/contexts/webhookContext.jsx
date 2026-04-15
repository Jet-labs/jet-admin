import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllWebhooksAPI } from "../../data/apis/webhook";
import PropTypes from "prop-types";

const WebhooksStateContext = React.createContext(undefined);
const WebhooksActionsContext = React.createContext(undefined);

const WebhooksContextProvider = ({ children }) => {
  const { tenantID } = useParams();

  const {
    isLoading: isLoadingWebhooks,
    data: webhooks,
    error: loadWebhooksError,
    isFetching: isFetchingWebhooks,
    isRefetching: isRefetchingWebhooks,
    refetch: refetchWebhooks,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WEBHOOKS(tenantID)],
    queryFn: () => getAllWebhooksAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  return (
    <WebhooksStateContext.Provider
      value={{
        webhooks,
        isLoadingWebhooks,
        isFetchingWebhooks,
        loadWebhooksError,
        isRefetchingWebhooks,
      }}
    >
      <WebhooksActionsContext.Provider
        value={{
          refetchWebhooks,
        }}
      >
        {children}
      </WebhooksActionsContext.Provider>
    </WebhooksStateContext.Provider>
  );
};

WebhooksContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useWebhooksState = () => {
  const context = React.useContext(WebhooksStateContext);
  if (context === undefined) {
    throw new Error("useWebhooksState must be used within a WebhooksContextProvider");
  }
  return context;
};

const useWebhooksActions = () => {
  const context = React.useContext(WebhooksActionsContext);
  if (context === undefined) {
    throw new Error("useWebhooksActions must be used within a WebhooksContextProvider");
  }
  return context;
};

export {
  WebhooksContextProvider,
  useWebhooksState,
  useWebhooksActions,
};
