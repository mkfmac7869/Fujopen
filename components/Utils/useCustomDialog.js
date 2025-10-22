import { useState, useCallback } from 'react';

/**
 * Custom hook for managing dialog state
 * Usage:
 * 
 * const { dialog, showDialog, closeDialog } = useCustomDialog();
 * 
 * showDialog({
 *   type: 'success',
 *   message: 'Operation completed!',
 *   confirmText: 'OK'
 * });
 * 
 * <CustomDialog {...dialog} onClose={closeDialog} />
 */
export function useCustomDialog() {
  const [dialog, setDialog] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: null,
    onConfirm: null,
    onCancel: null,
  });

  const showDialog = useCallback((options) => {
    setDialog({
      open: true,
      title: options.title || '',
      message: options.message || '',
      type: options.type || 'info',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || null,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(prev => ({ ...prev, open: false }));
  }, []);

  return {
    dialog,
    showDialog,
    closeDialog,
  };
}

export default useCustomDialog;

