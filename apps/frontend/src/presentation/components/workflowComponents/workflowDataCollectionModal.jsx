import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { JsonForms } from '@jsonforms/react';
import { jetFormsRenderers } from '@jet-admin/json-forms-renderers';
import { FaPaperPlane } from 'react-icons/fa';
import { 
    Button, 
    Spinner,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter 
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

    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState([]);

    const handleChange = useCallback(({ data, errors }) => {
        setFormData(data ?? {});
        setFormErrors(errors ?? []);
    }, []);

    const handleSubmit = useCallback(() => {
        if (formErrors.length > 0) return;
        onSubmit(formData);
    }, [formData, formErrors, onSubmit]);

    return (
        <Dialog open={true} onOpenChange={(open) => {
            if (!open && onDismiss) {
                onDismiss();
            }
        }}>
            <DialogContent className="sm:max-w-[480px] max-h-[85vh] flex flex-col p-0 overflow-hidden gap-0">
                <DialogHeader className="px-5 py-4 border-b shrink-0 text-left">
                    <DialogTitle className="text-base text-foreground font-medium">
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm text-muted-foreground">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="p-5 overflow-y-auto flex-1">
                    <JsonForms
                        schema={formSchema}
                        uischema={formUischema}
                        data={formData}
                        renderers={jetFormsRenderers}
                        onChange={handleChange}
                    />
                </div>

                <DialogFooter className="px-5 py-3.5 border-t bg-muted/20 shrink-0 sm:justify-end gap-2">
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
                        <FaPaperPlane className="w-3 h-3 mr-1.5" />
                        Submit &amp; continue
                    </Button>
                </DialogFooter>
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