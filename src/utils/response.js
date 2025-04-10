const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  };
  
  const errorResponse = (res, message = 'Error', statusCode = 500, error = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error
    });
  };
  
  const validationError = (res, errors) => {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  };
  
  module.exports = {
    successResponse,
    errorResponse,
    validationError
  };