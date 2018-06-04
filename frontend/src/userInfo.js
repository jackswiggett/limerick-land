const getUserId = () => {
  const existingValue = localStorage.getItem("userId");
  if (existingValue !== null) {
    return existingValue;
  }

  // https://gist.github.com/gordonbrander/2230317
  const newValue = Math.random()
    .toString(36)
    .substr(2, 9);
  localStorage.setItem("userId", newValue);
  return newValue;
};

export const userId = getUserId();