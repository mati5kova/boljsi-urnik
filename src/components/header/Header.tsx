import { useBoljsiUrnikContext } from "../../context/BoljsiUrnikContext";
import EditModeSwitch from "./editmodeswitch/EditModeSwitch";
import "./Header.css";
import SeasonSwitch from "./seasonswitch/SeasonSwitch";
import StudentNumberInput from "./studentnumberinput/StudentNumberInput";
import TimetableReset from "./timetablereset/TimetableReset";

export interface RefreshTimetableOptions {
    force?: boolean;
    reason?: "automatic" | "identity-change" | "student-change" | "waiting-retry" | "focus" | "manual-reset";
    skipComparison?: boolean;
}

export interface HeaderProps {
    refreshTimetable: (options?: RefreshTimetableOptions) => Promise<boolean>;
    schoolYearId: string;
    timetableStatusMessage: string | null;
    isTimetableReadOnly: boolean;
    fetchStatus: "idle" | "loading" | "ready" | "waiting" | "error";
}

export default function Header({
    refreshTimetable,
    schoolYearId,
    timetableStatusMessage,
    isTimetableReadOnly,
    fetchStatus,
}: HeaderProps) {
    const { urnikFriSeasonalPartOfUrl, studentNumber, isViewingASharedTimetable } = useBoljsiUrnikContext();

    return (
        <header className="header" style={isViewingASharedTimetable ? { height: "4rem" } : undefined}>
            <div className="header-left">
                <span className="title">
                    {`FRI ${schoolYearId.replace("_", "/")}, ${urnikFriSeasonalPartOfUrl} semester`}
                </span>
                {!isViewingASharedTimetable ? <span>{studentNumber}</span> : <span>Gledaš deljeni urnik</span>}
                {timetableStatusMessage && <span className="timetable-status">{timetableStatusMessage}</span>}
                {!timetableStatusMessage && fetchStatus === "error" && (
                    <span className="timetable-status">Osvežitev ni uspela. Prikazan je zadnji veljavni urnik.</span>
                )}
            </div>

            {!isViewingASharedTimetable && (
                <>
                    <div className="header-controls">
                        <SeasonSwitch />
                        <EditModeSwitch disabled={isTimetableReadOnly} />
                    </div>

                    <div className="header-actions">
                        <StudentNumberInput />
                        <TimetableReset refreshTimetable={refreshTimetable} />
                    </div>
                </>
            )}
        </header>
    );
}
