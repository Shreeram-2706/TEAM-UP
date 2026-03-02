import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import UserContext from '../../Context/UserContext';

const AddPostModal = ({ setShowAddPost, onPostCreated }) => {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    username: user?.username, 
    title: '',
    category: '',
    description: '',
    link: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // 5MB limit should match backend
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Image must be smaller than 5 MB');
        e.target.value = null; // reset input
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.title || !formData.category || !formData.description || !imageFile) {
    toast.error('All fields including image are required, except link which is optional');
    return;
  }

  if (!user?.id) {
    toast.error('You must be logged in to create a post');
    return;
  }

  setIsSubmitting(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('username', user.username);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('link', formData.link || '');
    formDataToSend.append('image', imageFile);

    const response = await fetch('http://localhost:8000/events/create', {
      method: 'POST',
      body: formDataToSend
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors array
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => err.msg).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(data.error || data.message || 'Failed to create post');
    }

    toast.success('Post created successfully!');
    setShowAddPost(false);
    onPostCreated?.(data.event || data.post);
    
    // Reset form
    setFormData({
      username: user.username,
      title: '',
      category: '',
      description: '',
      link: ''
    });
    setImageFile(null);
    setPreviewImage(null);

  } catch (error) {
    console.error('Submission error:', error);
    toast.error(error.message || 'Error creating post');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto no-scrollbar"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-[45%] overflow-hidden my-auto"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Create New Post</h2>
          <button 
            onClick={() => !isSubmitting && setShowAddPost(false)}
            className={`text-gray-400 hover:text-gray-600 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
              placeholder="Enter post title"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                required
              >
                <option value="">Select category</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Internship">Internship</option>
                <option value="Paper Presentation">Paper Presentation</option>
              </select>
            </div>
            <div className="space-y-1 col-span-2">
              <label className="block text-sm font-medium text-gray-700">Link (Optional)</label>
              <input
                name="link"
                type="url"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
              placeholder="Write a detailed description..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Image *</label>
            <label className={`cursor-pointer ${!imageFile ? 'border-2 border-dashed border-gray-300 rounded-lg p-4 w-full flex flex-col items-center justify-center hover:bg-gray-50 transition-colors' : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
              {imageFile ? (
                <div className="relative group">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewImage(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">Click to upload image</p>
                </div>
              )}
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddPost(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Create Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddPostModal;