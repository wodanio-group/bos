export const useFileDownload = () => {
  const toast = useToast();

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error('Failed to download file', e);
      toast.add({ type: 'error', title: 'Failed to download file' });
    }
  };

  return {
    downloadFile
  };
};
