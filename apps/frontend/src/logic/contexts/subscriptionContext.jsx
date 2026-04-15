import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllSubscriptionsAPI } from "../../data/apis/subscription";
import PropTypes from "prop-types";

const SubscriptionsStateContext = React.createContext(undefined);
const SubscriptionsActionsContext = React.createContext(undefined);

const SubscriptionsContextProvider = ({ children }) => {
  const { tenantID } = useParams();

  const {
    isLoading: isLoadingSubscriptions,
    data: subscriptions,
    error: loadSubscriptionsError,
    isFetching: isFetchingSubscriptions,
    isRefetching: isRefetchingSubscriptions,
    refetch: refetchSubscriptions,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.SUBSCRIPTIONS(tenantID)],
    queryFn: () => getAllSubscriptionsAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  return (
    <SubscriptionsStateContext.Provider
      value={{
        subscriptions,
        isLoadingSubscriptions,
        isFetchingSubscriptions,
        loadSubscriptionsError,
        isRefetchingSubscriptions,
      }}
    >
      <SubscriptionsActionsContext.Provider
        value={{
          refetchSubscriptions,
        }}
      >
        {children}
      </SubscriptionsActionsContext.Provider>
    </SubscriptionsStateContext.Provider>
  );
};

SubscriptionsContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useSubscriptionsState = () => {
  const context = React.useContext(SubscriptionsStateContext);
  if (context === undefined) {
    throw new Error("useSubscriptionsState must be used within a SubscriptionsContextProvider");
  }
  return context;
};

const useSubscriptionsActions = () => {
  const context = React.useContext(SubscriptionsActionsContext);
  if (context === undefined) {
    throw new Error("useSubscriptionsActions must be used within a SubscriptionsContextProvider");
  }
  return context;
};

export {
  SubscriptionsContextProvider,
  useSubscriptionsState,
  useSubscriptionsActions,
};
