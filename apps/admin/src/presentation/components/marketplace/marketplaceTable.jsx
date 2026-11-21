import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Spinner } from "@jet-admin/ui";
import { CONSTANTS } from "@/constants";
import {
  unpublishMarketplaceItemAPI,
  verifyMarketplaceItemAPI,
} from "@/data/apis/platform";
import { displayError } from "@/utils/notification";

export const MarketplaceTable = ({ data, isLoading }) => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [CONSTANTS.REACT_QUERY_KEYS.MARKETPLACE],
    });

  const verifyMutation = useMutation({
    mutationFn: ({ itemID, isVerified }) => verifyMarketplaceItemAPI({ itemID, isVerified }),
    retry: false,
    onSuccess: invalidate,
    onError: (error) => displayError(error?.message || error),
  });

  const unpublishMutation = useMutation({
    mutationFn: ({ itemID }) => unpublishMarketplaceItemAPI({ itemID }),
    retry: false,
    onSuccess: invalidate,
    onError: (error) => displayError(error?.message || error),
  });

  if (isLoading) {
    return (
      <div role="status" className="animate-pulse space-y-2 p-2">
        <div className="h-10 w-full rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-border/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-muted/40 text-left">
            <th className="px-3 py-2 font-medium text-muted-foreground">Item</th>
            <th className="px-3 py-2 font-medium text-muted-foreground">Type</th>
            <th className="px-3 py-2 font-medium text-muted-foreground">Category</th>
            <th className="px-3 py-2 font-medium text-muted-foreground">Installs</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {(data?.entries || []).map((item) => (
            <tr key={item.itemID} className="border-b border-border/50 last:border-b-0">
              <td className="px-3 py-2">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{item.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">{item.slug}</span>
                </div>
              </td>
              <td className="px-3 py-2">
                <Badge variant="outline">{item.itemType}</Badge>
              </td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{item.category || "—"}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{item.installCount}</td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      verifyMutation.isPending || unpublishMutation.isPending
                    }
                    onClick={() =>
                      verifyMutation.mutate({
                        itemID: item.itemID,
                        isVerified: !item.isVerified,
                      })
                    }
                  >
                    {item.isVerified ? "Unverify" : "Verify"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={
                      verifyMutation.isPending || unpublishMutation.isPending
                    }
                    onClick={() => unpublishMutation.mutate({ itemID: item.itemID })}
                  >
                    {unpublishMutation.isPending ? <Spinner size={14} /> : "Remove"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
