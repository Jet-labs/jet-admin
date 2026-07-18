/**
 * alert-dialog.jsx
 *
 * A thin semantic layer over dialog.jsx — all components delegate to Dialog
 * primitives so there is a single source of truth for layout, styling, and
 * context. The AlertDialog* names are kept for call-site compatibility.
 *
 * Trade-offs vs @radix-ui/react-alert-dialog:
 *  - role="dialog"  (not "alertdialog") — acceptable for internal usage
 *  - Escape key CAN close the dialog (Radix AlertDialog blocks it)
 *  - Action / Cancel are plain buttons wrapped in DialogClose (no Radix focus-guard)
 */
import * as React from "react";
import { cn } from "../lib/utils";
import { buttonVariants } from "./button";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "./dialog";

// ─── Root & trigger ───────────────────────────────────────────────────────────

const AlertDialog = Dialog;
const AlertDialogTrigger = DialogTrigger;
const AlertDialogPortal = DialogPortal;
const AlertDialogOverlay = DialogOverlay;

// ─── Content (narrower max-width than the default Dialog) ─────────────────────

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn("max-w-sm", className)}
    {...props}
  />
));
AlertDialogContent.displayName = "AlertDialogContent";

// ─── Header (hides the generic close icon — alert dialogs require
//     explicit confirmation or cancellation) ────────────────────────────────────

const AlertDialogHeader = ({ hideCloseIcon = true, ...props }) => (
  <DialogHeader hideCloseIcon={hideCloseIcon} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

// ─── Footer & Body (straight aliases) ────────────────────────────────────────

const AlertDialogFooter = DialogFooter;
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogBody = DialogBody;
AlertDialogBody.displayName = "AlertDialogBody";

// ─── Title & Description (straight aliases) ───────────────────────────────────

const AlertDialogTitle = DialogTitle;
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = DialogDescription;
AlertDialogDescription.displayName = "AlertDialogDescription";

// ─── Action (closes dialog + primary style) ───────────────────────────────────

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <DialogClose asChild>
    <button
      ref={ref}
      className={cn(buttonVariants(), className)}
      {...props}
    />
  </DialogClose>
));
AlertDialogAction.displayName = "AlertDialogAction";

// ─── Cancel (closes dialog + outline style) ───────────────────────────────────

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <DialogClose asChild>
    <button
      ref={ref}
      className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
      {...props}
    />
  </DialogClose>
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
