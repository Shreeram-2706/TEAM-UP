import React, { useState, useEffect } from 'react';
import { FileImage, FileText, File, Download, Plus, X } from 'lucide-react';
import UserContext from '../../Context/UserContext';
import { useContext } from 'react';
import io from 'socket.io-client';

const FileStacks = ({ projectID }) => {
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [socket, setSocket] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { user } = useContext(UserContext);
  const currentUserId = user?.id;
  const currentUserName = user?.username;

  useEffect(() => {
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && projectID) {
      socket.emit('joinProject', projectID);
      
      socket.on('fileUploaded', (newFile) => {
        setFiles(prevFiles => [newFile, ...prevFiles]);
      });

      socket.on('fileDeleted', (deletedFileId) => {
        setFiles(prevFiles => prevFiles.filter(file => file._id !== deletedFileId));
      });

      return () => {
        socket.emit('leaveProject', projectID);
        socket.off('fileUploaded');
        socket.off('fileDeleted');
      };
    }
  }, [socket, projectID]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`http://localhost:8000/files/project/${projectID}`);
        if (!response.ok) throw new Error('Failed to fetch files');
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    if (projectID) fetchFiles();
  }, [projectID]);

  const handleDownload = async (fileId) => {
    try {
      window.open(`http://localhost:8000/files/download/${fileId}`, '_blank');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDeleteClick = (fileId) => {
    setFileToDelete(fileId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:8000/files/delete/${fileToDelete}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleteModalOpen(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };

  const handleAddFile = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus(null);
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setSelectedFile(droppedFile);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !projectID) return;
  
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', currentUserId);  
    formData.append('userName', currentUserName); 
  
    try {
      setUploadStatus('uploading');
  
      const response = await fetch(`http://localhost:8000/files/upload/${projectID}`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Upload failed');
      }
  
      const data = await response.json();
      setUploadStatus('success');
  
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getFileIcon = (file) => {
    const fileType = file.type?.split('/')[0] || '';
    switch(fileType) {
      case 'image':
        return <FileImage size={24} />;
      case 'application':
        if (file.type?.includes('pdf')) {
          return <FileText size={24} />;
        }
        return <File size={24} />;
      default:
        return <File size={24} />;
    }
  };

  return (
    <div className='col-span-2 mx-3 p-4 bg-white rounded-xl shadow-md'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-xl font-semibold text-gray-800'>File Stack</h3>
        <button
          onClick={handleAddFile}
          className='p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors shadow-md'
        >
          <Plus size={20} />
        </button>
      </div>
      
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <File size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">No files uploaded yet</p>
          <button
            onClick={handleAddFile}
            className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
          >
            Upload your first file
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
        {files.map(file => (
          <li
            key={file._id}
            className="flex items-start p-4 rounded-xl border border-gray-100 hover:border-sky-200 hover:shadow-md transition-all bg-white"
          >
            <div
              className={`flex-shrink-0 p-3 mr-4 rounded-lg ${
                file.type?.includes('image')
                  ? 'bg-blue-50 text-blue-600'
                  : file.type?.includes('pdf')
                  ? 'bg-red-50 text-red-600'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              {getFileIcon(file)}
            </div>

            <div className="flex-1 min-w-0">
              <div className='w-full flex justify-between items-center mt-2'>
                <div className="mt-1 flex flex-wrap r text-sm text-gray-500 flex-col">
                <h2 className='text-sm font-bold text-gray-800 truncate'>
                  {file.name}
                </h2>
                    <span className="font-medium px-2 py-1 rounded-md bg-sky-50 text-xs w-fit">{file.uploader?.name || 'Unknown'}</span> 
                    <span className="font-medium text-xs mt-2"> {formatDate(file.uploadedAt)}</span>
                </div>
                <div className='flex flex-col gap-2'>
                  <Download size={20} className='text-gray-500 cursor-pointer bg-sky-100 rounded-full h-fit w-fit p-1.5 hover:bg-sky-500 hover:text-white duration-100' onClick={() => handleDownload(file._id)} />
                  <X size={20} className='text-red-500 cursor-pointer bg-red-100 rounded-full h-fit w-fit p-1.5 hover:bg-red-500 hover:text-white duration-100' onClick={() => handleDeleteClick(file._id)} />
                </div>
              </div>
              </div>
          </li>
        ))}
      </ul>

      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload File</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } transition-all`}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              {!selectedFile ? (
                <>
                  <div className="flex flex-col items-center justify-center">
                    <File size={48} className="text-gray-400 mb-3" />
                    <p className="mb-2 text-gray-600">Drag & drop your file here</p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <label className="px-4 py-2 bg-sky-500 text-white rounded-md cursor-pointer hover:bg-sky-600 transition-colors">
                      Browse Files
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={onFileChange}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  {getFileIcon(selectedFile)}
                  <p className="font-medium mt-2">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {uploadStatus === 'uploading' && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center mt-2">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-center">
                File uploaded successfully!
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
                Upload failed. Please try again.
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploadStatus === 'uploading'}
                className={`px-4 py-2 rounded-md text-white ${
                  !selectedFile ? 'bg-gray-400' : 'bg-sky-500 hover:bg-sky-600'
                } transition-colors`}
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-[#00000090] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <button 
                onClick={cancelDelete}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <p className="text-red-600 font-medium">
                Warning: This action cannot be undone!
              </p>
              <p className="text-gray-600 mt-1">
                Are you sure you want to permanently delete this file?
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileStacks;