export const startInstrument = async () => {
    try {
      const res = await fetch("http://localhost:8000/start");
      return await res.json();
    } catch (error) {
      console.error("Error starting instrument:", error);
    }
  };