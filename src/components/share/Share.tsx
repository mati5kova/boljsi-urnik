import { useCallback, useEffect, useMemo } from "react";
import { keysToRemove, longToShortLaaleNameKeyMap } from "../../constants/Constants";
import { useBoljsiUrnikContext } from "../../context/BoljsiUrnikContext";
import { makeSharableParam } from "../../functions/manipulateSearchParams";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import "./Share.css";

export default function Share() {
	const [copiedText, setCopiedText, copy] = useCopyToClipboard();
	const { actuallyRenderedTimetable, isViewingASharedTimetable, studentNumber } = useBoljsiUrnikContext();

	const shareUrl = useMemo(() => {
		if (!actuallyRenderedTimetable) return "";
		return `${window.location.origin}?sharedTimetable=${makeSharableParam(
			actuallyRenderedTimetable,
			longToShortLaaleNameKeyMap,
			keysToRemove
		)}`;
	}, [actuallyRenderedTimetable]);

	const handleCopy = useCallback(async () => {
		if (shareUrl) {
			await copy(shareUrl);
		}
	}, [copy, shareUrl]);

	useEffect(() => {
		setCopiedText(null);
	}, [setCopiedText, shareUrl]);

	if (isViewingASharedTimetable || !studentNumber) return null;

	return (
		<div className="share-wrapper">
			<button type="button" className="timetable-share" onClick={handleCopy}>
				Deli svoj urnik
			</button>

			{copiedText && (
				<div className="copied-preview" title={copiedText}>
					<a href={copiedText} target="_blank" rel="noopener noreferrer" className="copied-link">
						{copiedText}
					</a>
				</div>
			)}
		</div>
	);
}
