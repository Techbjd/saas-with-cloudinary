'use client'
import { useState, useEffect } from "react";

type DeviceKey = "mobile" | "tablet" | "desktop";

function useDeviceType(): DeviceKey {
  const [device, setDevice] = useState<DeviceKey>("desktop");

  useEffect(() => {
    function updateDevice() {
      const width = window.innerWidth;
      if (width < 768) setDevice("mobile");
      else if (width < 1024) setDevice("tablet");
      else setDevice("desktop");
    }

    updateDevice(); // set initial
    window.addEventListener("resize", updateDevice);

    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  return device;
}

export default useDeviceType;