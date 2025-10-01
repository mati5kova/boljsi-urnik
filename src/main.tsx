import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from "./App.tsx";
import { BoljsiUrnikProvider } from "./context/BoljsiUrnikContext.tsx";

const router = createBrowserRouter([
	{
		path: "*",
		element: <App />,
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BoljsiUrnikProvider>
			<RouterProvider router={router}></RouterProvider>
		</BoljsiUrnikProvider>
	</StrictMode>
);
