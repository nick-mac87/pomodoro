import { ThemeProvider } from "./context/ThemeContext.jsx";
import PixelPomo from "./PixelPomo.jsx";
import { migrateStorage } from "./utils/storage.js";

migrateStorage();

export default function App() {
  return (
    <ThemeProvider>
      <PixelPomo />
    </ThemeProvider>
  );
}
