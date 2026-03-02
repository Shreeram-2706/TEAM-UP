import React, { useRef, useState, useEffect } from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Globe, 
  Camera, 
  Edit2,
  Calendar,
  Briefcase,
  GraduationCap
} from 'lucide-react';

const ProfileHeader = ({ user, isOwnProfile, onEdit, onImageUpload }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageVersion, setImageVersion] = useState(Date.now());
  const [showUploadTooltip, setShowUploadTooltip] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Reset states when user profile picture changes
  useEffect(() => {
    setImageError(false);
    setPreviewImage(null);
    setImageVersion(Date.now());
  }, [user?.profilePicture]);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleImageClick = () => {
    if (isOwnProfile && !uploading) {
      fileInputRef.current.click();
    }
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }
    
    return true;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateImage(file);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // Upload
      setUploading(true);
      setUploadError(null);
      setImageError(false);
      
      if (!onImageUpload) {
        throw new Error('Image upload function is not provided');
      }
      
      await onImageUpload(file);
      
      // Force cache busting after successful upload
      setImageVersion(Date.now());
      setPreviewImage(null); // Clear preview after successful upload
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Failed to upload image');
      // Clear preview on error
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const getInitials = (username) => {
    if (!username) return '?';
    return username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const getImageUrl = () => {
    // If there's a preview, show it
    if (previewImage) {
      return previewImage;
    }

    // If no profile picture or default
    if (!user?.profilePicture || user.profilePicture === 'default.jpg') {
      return null;
    }

    // Handle full URLs
    if (user.profilePicture.startsWith('http')) {
      return `${user.profilePicture}${user.profilePicture.includes('?') ? '&' : '?'}v=${imageVersion}`;
    }

    // Handle relative paths
    const baseUrl = process.env.REACT_APP_API_URL || '';
    const imagePath = user.profilePicture.startsWith('/') ? user.profilePicture : `/${user.profilePicture}`;
    return `${baseUrl}${imagePath}?v=${imageVersion}`;
  };

  const renderProfileImage = () => {
    const imageUrl = getImageUrl();

    // Show uploading state
    if (uploading) {
      return (
        <div className="h-full w-full bg-[#1a1b4b] flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-[#ff6b35]"></div>
            <Camera className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" size={20} />
          </div>
        </div>
      );
    }

    // Show preview or actual image
    if (imageUrl && !imageError) {
      return (
        <img 
          src={imageUrl}
          alt={user?.username || 'Profile'} 
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      );
    }

    // Show initials fallback
    return (
      <div className="h-full w-full bg-gradient-to-br from-[#1a1b4b] to-[#2c3e50] flex items-center justify-center">
        <span className="text-4xl font-bold text-white">{getInitials(user?.username)}</span>
      </div>
    );
  };

  if (!user) return null;

  const formatJoinDate = () => {
    if (user.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    }
    return 'Recently';
  };

  const formatUrl = (url) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 relative overflow-hidden">
      {/* Header with dark blue gradient - matching SR profile */}
      <div className="h-24 bg-gradient-to-r from-[#1a1b4b] to-[#2c3e50] relative">
        {/* Camera icon overlay for own profile */}
        {isOwnProfile && onImageUpload && (
          <button
            onClick={handleImageClick}
            className="absolute bottom-0 right-8 transform translate-y-1/2 bg-[#ff6b35] hover:bg-[#ff8255] text-white p-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            title="Change profile photo"
          >
            <Camera size={20} />
          </button>
        )}
      </div>

      {/* Profile Content */}
      <div className="px-8 pb-8 relative">
        {/* Profile Image - Positioned to overlap header */}
        <div className="relative -mt-16 mb-6">
          <div className="relative group w-32 h-32">
            <div 
              className={`w-32 h-32 rounded-xl border-4 border-white shadow-xl overflow-hidden ${
                isOwnProfile && !uploading ? 'cursor-pointer' : ''
              }`}
              onClick={handleImageClick}
            >
              {renderProfileImage()}
            </div>
            
            {/* Upload overlay for hover */}
            {isOwnProfile && !uploading && onImageUpload && (
              <div 
                className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={handleImageClick}
              >
                <Camera className="text-white" size={24} />
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
          />
        </div>

        {/* Error message */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{uploadError}</p>
          </div>
        )}

        {/* User Info */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Info */}
          <div className="flex-1">
            {/* Name and Status */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-[#1a1b4b]">
                {user.username || 'User Name'}
              </h1>
              {user.isAvailable && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Available
                </span>
              )}
              {user.isFaculty && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  Faculty
                </span>
              )}
            </div>

            {/* Email */}
            {user.email && (
              <div className="flex items-center gap-2 mb-4">
                <Mail size={18} className="text-gray-400" />
                <span className="text-gray-600">{user.email}</span>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
                {copySuccess && (
                  <span className="text-xs text-green-600">Copied!</span>
                )}
              </div>
            )}

            {/* Department and Batch */}
            <div className="flex flex-wrap gap-3 mb-4">
              {user.department && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <Briefcase size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-700">{user.department}</span>
                </div>
              )}
              {user.batch && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <GraduationCap size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-700">Batch of {user.batch}</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <Calendar size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700">Joined {formatJoinDate()}</span>
              </div>
            </div>

            {/* Bio */}
            {user.description && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700">{user.description}</p>
              </div>
            )}

            {/* Skills */}
            {user.skills?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-[#1a1b4b] mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Social Links */}
          <div className="lg:w-64">
            <h3 className="text-lg font-semibold text-[#1a1b4b] mb-3">Connect</h3>
            <div className="space-y-2">
              {user.githubUrl && (
                <a
                  href={formatUrl(user.githubUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Github size={20} className="text-gray-700" />
                  <span className="text-sm text-gray-700">GitHub</span>
                </a>
              )}
              {user.linkedinUrl && (
                <a
                  href={formatUrl(user.linkedinUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <Linkedin size={20} className="text-blue-700" />
                  <span className="text-sm text-blue-700">LinkedIn</span>
                </a>
              )}
              {user.portfolioUrl && (
                <a
                  href={formatUrl(user.portfolioUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  <Globe size={20} className="text-purple-700" />
                  <span className="text-sm text-purple-700">Portfolio</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        {isOwnProfile && onEdit && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#ff6b35] hover:bg-[#ff8255] text-white rounded-lg transition-colors"
            >
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;