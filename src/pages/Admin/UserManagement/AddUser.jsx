import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Save, ArrowLeft, User, Mail, Lock, Shield, Building, AlertCircle } from 'lucide-react';
import { userService } from '../../../services/userService';

const AddUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    'Admin',
    'ReadOnlyAdmin',
    'WarehouseStaff',
    'HeadOfOperations',
    'MainDirector',
    'ProductionManager',
    'PackingMaterialsStoreManager',
    'FinishedGoodsStoreManager',
    'DataEntry'
  ];

  const departments = [
    'Admin',
    'WarehouseOperations',
    'HeadOfOperations',
    'MainDirector',
    'Production',
    'PackingMaterialsStore',
    'FinishedGoodsStore',
    'DataEntry'
  ];

  useEffect(() => {
    if (isEditing) {
      loadUserData();
    }
  }, [id, isEditing]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserById(id);
      if (userData) {
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          password: '', // Don't load password for security
          role: userData.role || '',
          department: userData.department || '',
          status: userData.status || 'active'
        });
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-assign department based on role
    if (name === 'role') {
      const roleDepartmentMap = {
        'Admin': 'Admin',
        'ReadOnlyAdmin': 'Admin',
        'WarehouseStaff': 'WarehouseOperations',
        'HeadOfOperations': 'HeadOfOperations',
        'MainDirector': 'MainDirector',
        'ProductionManager': 'Production',
        'PackingMaterialsStoreManager': 'PackingMaterialsStore',
        'FinishedGoodsStoreManager': 'FinishedGoodsStore',
        'DataEntry': 'DataEntry'
      };
      
      setFormData(prev => ({
        ...prev,
        department: roleDepartmentMap[value] || ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await userService.updateUserData(id, {
          name: formData.name,
          role: formData.role,
          department: formData.department,
          status: formData.status
        });
        setSuccess('User updated successfully!');
      } else {
        if (!formData.password) {
          setError('Password is required for new users');
          setLoading(false);
          return;
        }
        
        await userService.createNewUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department,
          status: formData.status
        });
        setSuccess('User created successfully!');
      }

      // Redirect after success
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} user`);
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? 'Update user information and permissions' : 'Create a new user account with role-based access'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-green-800 font-medium">{success}</p>
                <p className="text-green-600 text-sm">Redirecting to user list...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter full name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isEditing} // Can't change email when editing
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter email address"
              />
              {isEditing && (
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed after account creation</p>
              )}
            </div>

            {/* Password Field */}
            {!isEditing && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter password"
                  minLength="6"
                />
                <p className="mt-1 text-sm text-gray-500">Minimum 6 characters</p>
              </div>
            )}

            {/* Role Field */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Department Field */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Status Field */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {isEditing ? 'Update User' : 'Create User'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;