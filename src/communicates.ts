import { Communicates, CommunicatesHandlers } from './models/communicates.js';

export const communicatesFactory = ({ open, openTemporary }: CommunicatesHandlers): Communicates =>
  ({
    showMessage(message: string) {
      open({ message });
    },
    showSuccess(message: string) {
      open({ message, success: true });
    },
    showError(message: string) {
      open({ message, error: true });
    },
    showMessageTemporary(message: string) {
      openTemporary({ message });
    },
    showSuccessTemporary(message: string) {
      openTemporary({ message, success: true });
    },
    showErrorTemporary(message: string) {
      openTemporary({ message, error: true });
    },
  });

