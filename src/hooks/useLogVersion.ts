import { useEffect } from "react";
import { version } from "../../package.json";

export const useLogVersion = () => {
  useEffect(() => {
    console.log(version);
  }, []);
};
