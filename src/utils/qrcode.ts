// QR Code type definitions
export type QRCodeType = 'url' | 'text' | 'unknown';

// Function to detect QR code type
export const detectQRCodeType = (content: string): QRCodeType => {
  try {
    new URL(content);
    return 'url';
  } catch {
    return 'text';
  }
};

// Function to handle QR code content based on its type
export const handleQRCodeContent = async (type: QRCodeType, content: string): Promise<void> => {
  switch (type) {
    case 'url':
      window.open(content, '_blank');
      break;
    case 'text':
      // Just return the text content for now
      console.log('Text content:', content);
      break;
    default:
      console.log('Unknown QR code type');
  }
};