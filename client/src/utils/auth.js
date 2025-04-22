export const getUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // decode JWT payload
      return payload;
    } catch (e) {
      console.error('Token decode failed', e);
      return null;
    }
  };