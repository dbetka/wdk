export interface CommunicatesOptions {
  message: string,
  success?: boolean,
  error?: boolean,
}
export interface CommunicatesHandlers {
  open: (params: CommunicatesOptions) => void;
  openTemporary: (params: CommunicatesOptions) => void
}
type MessageFunction =  (message: string) => void

export interface Communicates {
  showMessage: MessageFunction;
  showSuccess: MessageFunction;
  showError: MessageFunction;
  showMessageTemporary: MessageFunction;
  showSuccessTemporary: MessageFunction;
  showErrorTemporary: MessageFunction;
}
