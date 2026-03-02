import React, { useState } from 'react';
import { X, Github, Linkedin, Globe, User, Mail, BookOpen, Award } from 'lucide-react';
import Select from 'react-select';

const skillOptions = [
    { value: 'HTML', label: 'HTML' },
    { value: 'CSS', label: 'CSS' },
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'React', label: 'React' },
    { value: 'Vue.js', label: 'Vue.js' },
    { value: 'Next.js', label: 'Next.js' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Express.js', label: 'Express.js' },
    { value: 'Python', label: 'Python' },
    { value: 'Django', label: 'Django' },
    { value: 'Flask', label: 'Flask' },
    { value: 'Java', label: 'Java' },
    { value: 'Spring Boot', label: 'Spring Boot' },
    { value: 'C++', label: 'C++' },
    { value: 'MySQL', label: 'MySQL' },
    { value: 'MongoDB', label: 'MongoDB' },
    { value: 'Firebase', label: 'Firebase' },
    { value: 'Git', label: 'Git' },
    { value: 'GitHub', label: 'GitHub' },
    { value: 'Figma', label: 'Figma' },
    { value: 'Canva', label: 'Canva' },
    { value: 'REST API', label: 'REST API' },
    { value: 'GraphQL', label: 'GraphQL' },
    { value: 'Linux', label: 'Linux' },
    { value: 'AWS', label: 'AWS' },
    { value: 'Docker', label: 'Docker' },
    { value: 'Postman', label: 'Postman' },
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Deep Learning', label: 'Deep Learning' },
    { value: 'NLP', label: 'NLP' },
    { value: 'TensorFlow', label: 'TensorFlow' },
    { value: 'OpenCV', label: 'OpenCV' },
    { value: 'Data Structures', label: 'Data Structures' },
    { value: 'Algorithms', label: 'Algorithms' },
    { value: 'Problem Solving', label: 'Problem Solving' },
];

const departmentOptions = [
    { value: 'CSE', label: 'Computer Science Engineering' },
    { value: 'AIDS', label: 'Artificial Intelligence and Data Science' },
    { value: 'AIML', label: 'Artificial Intelligence and Machine Learning' },
    { value: 'CCE', label: 'Computer and Communication Engineering' },
    { value: 'ECE', label: 'Electronics and Communication Engineering' },
    { value: 'EEE', label: 'Electrical and Electronics Engineering' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'CSBS', label: 'Computer Science and Business Systems' },
    { value: 'MECH', label: 'Mechanical Engineering' },
];

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        department: user?.department || '',
        description: user?.description || '',
        skills: user?.skills || [],
        linkedinUrl: user?.linkedinUrl || '',
        githubUrl: user?.githubUrl || '',
        portfolioUrl: user?.portfolioUrl || '',
        isAvailable: user?.isAvailable || false,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSkillsChange = (selectedOptions) => {
        setFormData(prev => ({
            ...prev,
            skills: selectedOptions ? selectedOptions.map(option => option.value) : []
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username?.trim()) {
            newErrors.username = 'Username is required';
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@sece\.ac\.in$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Must be a valid @sece.ac.in email';
        }

        // URL validations (optional fields)
        if (formData.linkedinUrl && !formData.linkedinUrl.match(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)) {
            newErrors.linkedinUrl = 'Invalid LinkedIn URL format';
        }

        if (formData.githubUrl && !formData.githubUrl.match(/^https?:\/\/(www\.)?github\.com\/.*$/)) {
            newErrors.githubUrl = 'Invalid GitHub URL format';
        }

        if (formData.portfolioUrl && !formData.portfolioUrl.match(/^https?:\/\/.+/)) {
            newErrors.portfolioUrl = 'Invalid URL format (must start with http:// or https://)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-scrollbar">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
                    <h2 className="text-xl py-4 font-bold text-gray-900">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        type="button"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <User size={18} className="text-blue-500" />
                            Basic Information
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username *
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Department</option>
                                {departmentOptions.map(dept => (
                                    <option key={dept.value} value={dept.value}>
                                        {dept.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bio / Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Award size={18} className="text-blue-500" />
                            Social & Professional Links
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Linkedin size={16} className="text-blue-600" />
                                LinkedIn URL
                            </label>
                            <input
                                type="url"
                                name="linkedinUrl"
                                value={formData.linkedinUrl}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/username"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.linkedinUrl ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.linkedinUrl && (
                                <p className="mt-1 text-sm text-red-500">{errors.linkedinUrl}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Github size={16} className="text-gray-700" />
                                GitHub URL
                            </label>
                            <input
                                type="url"
                                name="githubUrl"
                                value={formData.githubUrl}
                                onChange={handleChange}
                                placeholder="https://github.com/username"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.githubUrl ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.githubUrl && (
                                <p className="mt-1 text-sm text-red-500">{errors.githubUrl}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Globe size={16} className="text-purple-600" />
                                Portfolio URL
                            </label>
                            <input
                                type="url"
                                name="portfolioUrl"
                                value={formData.portfolioUrl}
                                onChange={handleChange}
                                placeholder="https://yourportfolio.com"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.portfolioUrl ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.portfolioUrl && (
                                <p className="mt-1 text-sm text-red-500">{errors.portfolioUrl}</p>
                            )}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <BookOpen size={18} className="text-blue-500" />
                            Skills
                        </h3>

                        <Select
                            options={skillOptions}
                            isMulti
                            className="w-full"
                            classNamePrefix="select"
                            placeholder="Select or type skills..."
                            value={skillOptions.filter(option =>
                                formData.skills?.includes(option.value)
                            )}
                            onChange={handleSkillsChange}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    minHeight: '42px',
                                    borderColor: '#e5e7eb',
                                    '&:hover': {
                                        borderColor: '#3b82f6'
                                    }
                                })
                            }}
                        />
                    </div>

                    {/* Availability */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Availability</h3>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isAvailable"
                                checked={formData.isAvailable}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Available for collaboration / projects</span>
                        </label>
                    </div>

                    {/* Form Actions */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;