import React, { useState, useCallback } from 'react';
import { Check, Send, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { JsonForms } from '@jsonforms/react';
import { jetFormsRenderers } from '@jet-admin/json-forms-renderers';
import { 
    Button,
    Spinner,
    Textarea,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogBody
} from '@jet-admin/ui';

/**
 * WorkflowDataCollectionModal
 *
 * Shown when the workflow emits a `workflow_data_collection_request` socket event.
 * Renders the JSON-Forms schema provided in collectionConfig and submits the
 * collected data back to the backend to resume the paused workflow.
 */
export const WorkflowDataCollectionModal = ({
    request,      // { collectionRequestID, collectionType, collectionConfig }
    onSubmit,     // async (submittedData: object) => void
    onDismiss,    // () => void — closes without submitting (workflow stays paused)
    isSubmitting = false,
}) => {
    const { collectionConfig = {} } = request ?? {};
    const {
        title = 'Input required',
        description = '',
        formSchema = { type: 'object', properties: {} },
        formUischema = { type: 'VerticalLayout', elements: [] },
    } = collectionConfig;
    const isApproval = collectionConfig.collectionType === 'approval';

    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState([]);
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState(null);

    const handleChange = useCallback(({ data, errors }) => {
        setFormData(data ?? {});
        setFormErrors(errors ?? []);
    }, []);

    const handleSubmit = useCallback(() => {
        if (formErrors.length > 0) return;
        onSubmit(formData);
    }, [formData, formErrors, onSubmit]);

    // Approval decision buttons. Cancel dismisses without submitting —
    // the workflow stays paused and the dialog can be reopened.
    const handleDecision = useCallback((decision) => {
        if (collectionConfig.requireComment && !comment.trim()) {
            setCommentError('A comment is required to record this decision.');
            return;
        }
        setCommentError(null);
        onSubmit({ decision, comment });
    }, [comment, collectionConfig.requireComment, onSubmit]);

    const approveLabel = collectionConfig.approveLabel || 'Accept';
    const rejectLabel = collectionConfig.rejectLabel || 'Reject';
    const cancelLabel = collectionConfig.cancelLabel || 'Cancel';

    return (
        <Dialog open={true} onOpenChange={(open) => {
            if (!open && onDismiss) {
                onDismiss();
            }
        }}>
            <DialogContent >
                <DialogHeader >
                    <DialogTitle >
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription >
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {isApproval ? (
                    <DialogBody >
                        {collectionConfig.approvers && (
                            <p className="text-xs text-muted-foreground mb-2">
                                Requested from: <span className="font-medium text-foreground">{collectionConfig.approvers}</span>
                            </p>
                        )}
                        <label className="text-xs font-medium text-muted-foreground">
                            Comment{collectionConfig.requireComment ? ' (required)' : ' (optional)'}
                        </label>
                        <Textarea
                            value={comment}
                            placeholder="Reason for your decision..."
                            rows={3}
                            disabled={isSubmitting}
                            onChange={(e) => { setComment(e.target.value); if (commentError) setCommentError(null); }}
                            className="mt-1 w-full"
                        />
                        {commentError && (
                            <p className="text-xs text-red-500 mt-1">{commentError}</p>
                        )}
                    </DialogBody>
                ) : (
                    <DialogBody >
                        <JsonForms
                            schema={formSchema}
                            uischema={formUischema}
                            data={formData}
                            renderers={jetFormsRenderers}
                            onChange={handleChange}
                        />
                    </DialogBody>
                )}

                {isApproval ? (
                    <DialogFooter >
                        <Button type="button" variant="outline" size="sm" onClick={onDismiss} disabled={isSubmitting}>
                            <X className="w-3 h-3 mr-1.5" />
                            {cancelLabel}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDecision('reject')}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Spinner className="mr-2" size={14} />}
                            <X className="w-3 h-3 mr-1.5" />
                            {rejectLabel}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => handleDecision('approve')}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Spinner className="mr-2" size={14} />}
                            <Check className="w-3 h-3 mr-1.5" />
                            {approveLabel}
                        </Button>
                    </DialogFooter>
                ) : (
                    <DialogFooter >
                        <Button type="button" variant="outline" size="sm" onClick={onDismiss}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSubmit}
                            disabled={isSubmitting || formErrors.length > 0}
                        >
                            {isSubmitting && <Spinner className="mr-2" size={14} />}
                            <Send className="w-3 h-3 mr-1.5" />
                            Submit &amp; continue
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

WorkflowDataCollectionModal.propTypes = {
    request: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool,
};