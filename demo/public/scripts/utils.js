// Example utility functions to demonstrate script loading
export const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

export const generateId = () => {
  return Math.random().toString(36).substring(2);
};
