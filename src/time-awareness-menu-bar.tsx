import { Icon, MenuBarExtra } from "@raycast/api";
import { showFailureToast, useCachedState, usePromise } from "@raycast/utils";
import { DEFAULTS, ICONS } from "./constants";
import { processActiveState } from "./services/active-session";
import { triggerIntervalCompleteNotification } from "./utils/notifications";
import { getParsedPreferences } from "./utils/preferences";
import {
	getConfettiEnabled,
	resetActiveState,
	resetSessionTimeOnly,
	resetStatsOnly,
	setConfettiEnabled,
} from "./utils/storage";
import { formatTime } from "./utils/time";

export default function Command() {
	const { activeIntervalMinutes } = getParsedPreferences();

	const [confettiEnabled, setConfettiEnabledState] = useCachedState<boolean>(
		"confetti-enabled",
		true,
		{
			cacheNamespace: "time-awareness",
		},
	);

	const {
		data: state,
		isLoading,
		revalidate,
	} = usePromise(processActiveState, [], {
		onData: async ({ shouldNotify }) => {
			if (shouldNotify) {
				await triggerIntervalCompleteNotification(activeIntervalMinutes);
			}
		},
		onError: (error) => {
			showFailureToast(error, { title: "Failed to check active status" });
		},
	});

	usePromise(getConfettiEnabled, [], {
		onData: (enabled) => {
			setConfettiEnabledState(enabled);
		},
	});

	const activeSeconds = state?.accumulatedActiveSeconds ?? 0;
	const sessionCount = state?.sessionCount ?? 0;
	const isIdle = state?.isIdle ?? false;
	const achievementTimestamp = state?.achievementTimestamp ?? 0;

	const now = Date.now();
	const showAchievement =
		achievementTimestamp > 0 &&
		now - achievementTimestamp <= DEFAULTS.ACHIEVEMENT_DISPLAY_DURATION_MS;

	const menuBarTitle = showAchievement
		? "🩷"
		: isIdle
			? ICONS.IDLE_HEART
			: formatTime(activeSeconds, false);

	const handleConfettiToggle = async () => {
		const newValue = !confettiEnabled;
		setConfettiEnabledState(newValue);
		await setConfettiEnabled(newValue);
	};

	return (
		<MenuBarExtra title={menuBarTitle} isLoading={isLoading}>
			<MenuBarExtra.Section title="Current Session">
				<MenuBarExtra.Item
					title={`Active Time: ${formatTime(activeSeconds)}`}
				/>
			</MenuBarExtra.Section>

			<MenuBarExtra.Section title="Stats">
				<MenuBarExtra.Item title={`Intervals Completed: ${sessionCount}`} />
			</MenuBarExtra.Section>

			<MenuBarExtra.Section title="Settings">
				<MenuBarExtra.Item
					icon={confettiEnabled ? Icon.Checkmark : Icon.XMarkCircle}
					title="Enable Confetti"
					onAction={handleConfettiToggle}
				/>
			</MenuBarExtra.Section>

			<MenuBarExtra.Section>
				<MenuBarExtra.Item
					icon={Icon.ArrowClockwise}
					title="Refresh"
					shortcut={{ modifiers: ["cmd"], key: "r" }}
					onAction={revalidate}
				/>
				<MenuBarExtra.Item
					icon={Icon.Clock}
					title="Reset Session Time"
					shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
					onAction={async () => {
						await resetSessionTimeOnly();
						revalidate();
					}}
				/>
				<MenuBarExtra.Item
					icon={Icon.Hashtag}
					title="Reset Stats"
					onAction={async () => {
						await resetStatsOnly();
						revalidate();
					}}
				/>
				<MenuBarExtra.Item
					icon={Icon.Trash}
					title="Reset All"
					onAction={async () => {
						await resetActiveState();
						revalidate();
					}}
				/>
			</MenuBarExtra.Section>
		</MenuBarExtra>
	);
}
