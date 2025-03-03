import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BoljsiUrnikProvider } from "./context/BoljsiUrnikContext.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BoljsiUrnikProvider>
			<App />
		</BoljsiUrnikProvider>
	</StrictMode>
);
