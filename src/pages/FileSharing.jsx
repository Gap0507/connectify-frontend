import React, { useState, useCallback,useEffect } from 'react';
import { useSocket } from '../components/Context/SocketProvider';
import { Upload, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

const FileSharing = ({ roomId, remoteSocketId }) => {
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [lastSentFile, setLastSentFile] = useState(null);
  const socket = useSocket();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const sendFile = useCallback(() => {
    if (!file) return;

    setSending(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      socket.emit('file:send', {
        to: remoteSocketId,
        fileName: file.name,
        fileData: event.target.result,
      });
    };
    reader.readAsArrayBuffer(file);
  }, [file, socket, remoteSocketId]);

  useEffect(() => {
    const handleFileSent = () => {
      toast.success('File sent successfully!');
      setLastSentFile(file.name);
      setFile(null);
      setSending(false);
    };

    const handleFileReceived = ({ fileName, fileData }) => {
      const blob = new Blob([fileData]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Received file: ${fileName}`);
    };

    socket.on('file:sent', handleFileSent);
    socket.on('file:received', handleFileReceived);

    return () => {
      socket.off('file:sent', handleFileSent);
      socket.off('file:received', handleFileReceived);
    };
  }, [socket, file]);

  return (
    <div className="bg-gray-800 rounded-xl p-4 mt-4 text-white">
      <h3 className="text-lg font-semibold mb-3">File Sharing</h3>
      <div className="flex items-center space-x-3">
        <label className="flex-1">
          <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 text-center">
            {file ? file.name : 'Choose File'}
          </div>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          onClick={sendFile}
          disabled={!file || sending}
          className={`bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 px-4 transition duration-300 ease-in-out transform hover:scale-105 ${
            !file || sending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {sending ? (
            <div className="flex items-center">
              <Upload className="animate-bounce mr-2" size={20} />
              Sending...
            </div>
          ) : (
            <div className="flex items-center">
              <Upload className="mr-2" size={20} />
              Send
            </div>
          )}
        </button>
      </div>
      {lastSentFile && (
        <div className="mt-3 text-sm text-gray-300">
          Last sent: {lastSentFile}
          <Check className="inline-block ml-2 text-green-500" size={16} />
        </div>
      )}
    </div>
  );
};

export default FileSharing;