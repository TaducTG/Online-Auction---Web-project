import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changePassword, updateProfile } from "../api/user";
import { CiMail, CiUser, CiLock, CiCamera, CiPhone, CiLocationOn } from "react-icons/ci";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/auth/authSlice";
import LoadingScreen from "../components/LoadingScreen";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  
  const [isError, setIsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    bio: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    }
  });

  // Initialize profile data when user data is available
  useEffect(() => {
    if (user?.user) {
      setProfileData({
        name: user.user.name || "",
        phone: user.user.phone || "",
        bio: user.user.bio || "",
        address: {
          street: user.user.address?.street || "",
          city: user.user.address?.city || "",
          state: user.user.address?.state || "",
          zipCode: user.user.address?.zipCode || "",
          country: user.user.address?.country || ""
        }
      });
    }
  }, [user]);

  const passwordMutation = useMutation({
    mutationFn: () => changePassword(passwordData),
    onSuccess: () => {
      setSuccessMessage("Password Changed Successfully");
      setTimeout(() => {
        setSuccessMessage("");
      }, 10000);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      setIsError(error?.response?.data?.error);
      setTimeout(() => {
        setIsError("");
      }, 10000);
    },
  });

  const profileMutation = useMutation({
    mutationFn: () => updateProfile(profileData),
    onSuccess: (data) => {
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 10000);
      
      // Update user in Redux store
      dispatch(setUser({ user: data.user }));
      setIsEditingProfile(false);
    },
    onError: (error) => {
      setIsError(error?.response?.data?.error || "Failed to update profile");
      setTimeout(() => {
        setIsError("");
      }, 10000);
    },
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setProfileData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setIsError("Please enter all fields");
      setTimeout(() => {
        setIsError("");
      }, 10000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setIsError("New password and confirm password do not match.");
      setTimeout(() => {
        setIsError("");
      }, 10000);
      return;
    }
    passwordMutation.mutate();
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      setIsError("Name is required");
      setTimeout(() => {
        setIsError("");
      }, 10000);
      return;
    }
    profileMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-500">
              Update your personal information and password
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden border border-gray-200 rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="relative mb-4 sm:mb-0">
                  <img
                    src={user.user.avatar}
                    alt="User avatar"
                    className="h-20 w-20 rounded-full bg-gray-200 mx-auto sm:mx-0"
                  />
                  <button className="absolute bottom-0 right-0 sm:right-0 bg-white rounded-full p-1 border border-gray-300 shadow-sm">
                    <CiCamera className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="ml-0 sm:ml-4 text-center sm:text-left flex-1">
                  <h2 className="text-lg font-medium text-gray-900">
                    {user.user.name}
                  </h2>
                  <p className="text-sm text-gray-500">{user.user.email}</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="divide-y divide-gray-200">
              {/* Personal Information */}
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-500' : ''}`}
                        placeholder="Your full name"
                        required
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={user.user.email}
                        disabled
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-500' : ''}`}
                        placeholder="+84 123 456 789"
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows={3}
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-500' : ''}`}
                      placeholder="Tell us about yourself..."
                      disabled={!isEditingProfile}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CiLocationOn className="h-5 w-5 mr-2" />
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="address.street"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      id="address.street"
                      value={profileData.address.street}
                      onChange={handleProfileChange}
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-500' : ''}`}
                      placeholder="123 Main Street"
                      disabled={!isEditingProfile}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address.city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      id="address.city"
                      value={profileData.address.city}
                      onChange={handleProfileChange}
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-500' : ''}`}
                      placeholder="Ho Chi Minh"
                      disabled={!isEditingProfile}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address.state"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      id="address.state"
                      value={profileData.address.state}
                      onChange={handleProfileChange}
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-500' : ''}`}
                      placeholder="District 1"
                      disabled={!isEditingProfile}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address.zipCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      id="address.zipCode"
                      value={profileData.address.zipCode}
                      onChange={handleProfileChange}
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-500' : ''}`}
                      placeholder="700000"
                      disabled={!isEditingProfile}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address.country"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      id="address.country"
                      value={profileData.address.country}
                      onChange={handleProfileChange}
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!isEditingProfile ? 'bg-gray-50 text-gray-500' : ''}`}
                      placeholder="Vietnam"
                      disabled={!isEditingProfile}
                    />
                  </div>
                </div>
              </div>

              {/* Save button for profile */}
              {isEditingProfile && (
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        // Reset to original values
                        if (user?.user) {
                          setProfileData({
                            name: user.user.name || "",
                            phone: user.user.phone || "",
                            bio: user.user.bio || "",
                            address: {
                              street: user.user.address?.street || "",
                              city: user.user.address?.city || "",
                              state: user.user.address?.state || "",
                              zipCode: user.user.address?.zipCode || "",
                              country: user.user.address?.country || ""
                            }
                          });
                        }
                      }}
                      className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileMutation.isPending}
                      className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {profileMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Password Change Section */}
          <div className="bg-white shadow overflow-hidden border border-gray-200 rounded-md mt-6">
            <form onSubmit={handlePasswordSubmit} className="divide-y divide-gray-200">
              {/* Password */}
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Change Password
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Current Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your current password"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      New Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter new password"
                        minLength={8}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {isError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {isError}
                    </div>
                  )}

                  {/* Success Message */}
                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                      {successMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordMutation.isPending}
                    className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordMutation.isPending ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
