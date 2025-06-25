// Environment Variable Validation
const requiredEnvVars = {
  development: [
    'ADMIN_PASSWORD',
    'PORT'
  ],
  production: [
    'ADMIN_PASSWORD',
    'DATABASE_URL',
    'FRONTEND_URL',
    'NODE_ENV'
  ]
};

function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Security warnings
  if (process.env.ADMIN_PASSWORD === 'sizzle123') {
    warnings.push('ADMIN_PASSWORD is using the default value. Please change it for security!');
  }

  if (env === 'production') {
    if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL === '*') {
      warnings.push('FRONTEND_URL should be set to a specific domain in production for security');
    }

    if (!process.env.DATABASE_URL) {
      missing.push('DATABASE_URL is required for production deployment');
    }
  }

  // Port validation
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      warnings.push('PORT must be a valid number between 1 and 65535');
    }
  }

  return { missing, warnings, isValid: missing.length === 0 };
}

module.exports = { validateEnvironment };