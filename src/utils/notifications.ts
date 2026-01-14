import { open, showHUD } from "@raycast/api";
import { getConfettiEnabled } from "./storage";

export async function triggerIntervalCompleteNotification(minutes: number): Promise<void> {
  const enableConfetti = await getConfettiEnabled();
  try {
    await showHUD(`🩷 You have been active for ${minutes} minutes`);
    if (enableConfetti) {
      await open("raycast://extensions/raycast/raycast/confetti?emojis=🩷");
    }
  } catch (error) {
    console.error("Failed to trigger notification:", error);
  }
}
