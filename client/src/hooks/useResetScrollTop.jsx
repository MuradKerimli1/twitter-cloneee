import { useEffect } from "react";

const useResetScrollTopOnLocationChange = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [window.location.pathname]);
};

export default useResetScrollTopOnLocationChange;
