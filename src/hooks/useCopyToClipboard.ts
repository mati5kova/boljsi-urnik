import { Dispatch, SetStateAction, useCallback, useState } from "react";

type CopiedValue = string | null;
type SetCopiedValue = Dispatch<SetStateAction<CopiedValue>>;
type CopyFn = (text: string) => Promise<boolean>;

async function fallbackCopyToClipboard(text: string) {
	const ta = document.createElement("textarea");
	ta.value = text;
	ta.setAttribute("readonly", "");
	ta.style.position = "fixed";
	ta.style.top = "0";
	ta.style.left = "-9999px";
	document.body.appendChild(ta);
	ta.select();
	try {
		return document.execCommand("copy");
	} catch {
		return false;
	} finally {
		document.body.removeChild(ta);
	}
}

export function useCopyToClipboard(): [CopiedValue, SetCopiedValue, CopyFn] {
	const [copiedText, setCopiedText] = useState<CopiedValue>(null);

	const copy: CopyFn = useCallback(async (text) => {
		setCopiedText(text);

		const hasClipboard = typeof navigator !== "undefined" && !!navigator.clipboard;
		const isSecure = typeof window !== "undefined" && (window.isSecureContext ?? false);

		if (hasClipboard && isSecure) {
			try {
				await navigator.clipboard.writeText(text);
				return true;
			} catch {
				// fallback
			}
		}
		const ok = await fallbackCopyToClipboard(text);
		return ok;
	}, []);

	return [copiedText, setCopiedText, copy];
}
