// Feature flags for controlling application features

const featureFlags = {
  adminRegistrationEnabled: true, // Set to false to disable admin registration
};

/**
 * Check if admin registration is enabled
 * @returns {boolean}
 */
const isAdminRegistrationEnabled = () => {
  return featureFlags.adminRegistrationEnabled;
};

module.exports = {
  isAdminRegistrationEnabled,
  featureFlags,
};
