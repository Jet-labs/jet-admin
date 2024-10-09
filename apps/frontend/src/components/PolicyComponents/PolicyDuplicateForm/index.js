import { Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FaCopy } from "react-icons/fa6";
import { duplicatePolicyAPI } from "../../../api/policy";
import { LOCAL_CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../contexts/authContext";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ConfirmationDialog } from "../../ConfirmationDialog";
import { useNavigate, useNavigation } from "react-router-dom";
export const PolicyDuplicateForm = ({ id }) => {
  const { pmUser } = useAuthState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [
    isDuplicatePolicyConfirmationOpen,
    setIsDuplicatePolicyConfirmationOpen,
  ] = useState(false);

  const policyAddAuthorization = useMemo(() => {
    return pmUser && pmUser.extractPolicyAddAuthorization();
  }, [pmUser]);

  const {
    isPending: isDeletingRow,
    isSuccess: isDuplicatePolicySuccess,
    isError: isDuplicatePolicyError,
    error: duplicatePolicyError,
    mutate: duplicatePolicy,
  } = useMutation({
    mutationFn: ({ id }) => duplicatePolicyAPI({ pmPolicyObjectID: id }),
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.POLICY_ADDITION_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.POLICIES,
      ]);
      navigate(-1);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  const _handleOpenDuplicatePolicyConfirmation = () => {
    setIsDuplicatePolicyConfirmationOpen(true);
  };
  const _handleCloseDuplicatePolicyConfirmation = () => {
    setIsDuplicatePolicyConfirmationOpen(false);
  };

  const _handleDuplicatePolicy = () => {
    duplicatePolicy({ id });
    setIsDuplicatePolicyConfirmationOpen(false);
  };
  return (
    policyAddAuthorization && (
      <>
        <Button
          onClick={_handleOpenDuplicatePolicyConfirmation}
          startIcon={<FaCopy className="!text-sm" />}
          size="medium"
          variant="outlined"
          className="!ml-2"
          color="primary"
        >
          {LOCAL_CONSTANTS.STRINGS.DUPLICATE_BUTTON_TEXT}
        </Button>
        <ConfirmationDialog
          open={isDuplicatePolicyConfirmationOpen}
          onAccepted={_handleDuplicatePolicy}
          onDecline={_handleCloseDuplicatePolicyConfirmation}
          title={LOCAL_CONSTANTS.STRINGS.POLICY_DUPLICATE_CONFIRMATION_TITLE}
          message={`${LOCAL_CONSTANTS.STRINGS.POLICY_DUPLICATE_CONFIRMATION_BODY} - ${id}`}
        />
      </>
    )
  );
};
