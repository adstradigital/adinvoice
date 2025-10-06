// errorHandler.js
const setupInterceptors = (API) => {
  API.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 401 && data?.code === "token_not_valid") {
        // Dispatch a global custom event
        window.dispatchEvent(new Event("sessionExpired"));
      }

      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;
