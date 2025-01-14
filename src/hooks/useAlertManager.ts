import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const ALERTS_ENABLED_KEY = 'tideAlertsEnabled';
const LAST_ALERT_TIME_KEY = 'lastAlertTime';
const SHOWN_ALERTS_KEY = 'shownAlerts';

export const useAlertManager = (upcomingAlerts: Array<{
  date: string;
  time: string;
  type: string;
}>) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Use React Query to manage alert enabled state
  const { data: alertsEnabled = false } = useQuery({
    queryKey: ['alertsEnabled'],
    queryFn: () => localStorage.getItem(ALERTS_ENABLED_KEY) === 'true',
    staleTime: Infinity,
  });

  const checkAndShowAlert = (isInitial = false) => {
    console.log('Checking alerts - Enabled:', alertsEnabled);
    console.log('Upcoming alerts:', upcomingAlerts);
    
    if (!alertsEnabled) return;

    const now = new Date();
    const today = startOfDay(now);
    const todayEnd = endOfDay(now);
    
    // Filter alerts for today only
    const todayAlerts = upcomingAlerts.filter(alert => {
      const alertDate = parseISO(`${alert.date} ${alert.time}`);
      return isAfter(alertDate, today) && isBefore(alertDate, todayEnd);
    });

    console.log('Today\'s alerts:', todayAlerts);

    if (todayAlerts.length > 0) {
      todayAlerts.forEach(alert => {
        toast({
          title: "Upcoming Low Tide Alert",
          description: `Low tide on ${alert.date} at ${alert.time} coincides with ${alert.type}`,
          duration: 5000,
        });
      });

      // Update last alert time
      localStorage.setItem(LAST_ALERT_TIME_KEY, now.getTime().toString());
      queryClient.setQueryData(['lastAlertTime'], now.getTime());
    }
  };

  // Mutation to toggle alerts
  const toggleAlertsMutation = useMutation({
    mutationFn: (newState: boolean) => {
      console.log('Toggling alerts to:', newState);
      localStorage.setItem(ALERTS_ENABLED_KEY, String(newState));
      return Promise.resolve(newState);
    },
    onSuccess: (newState) => {
      queryClient.setQueryData(['alertsEnabled'], newState);
      if (newState) {
        // Immediately check for alerts when enabled
        checkAndShowAlert(true);
      }
    },
  });

  const toggleAlerts = () => {
    console.log('Toggle alerts called');
    toggleAlertsMutation.mutate(!alertsEnabled);
  };

  return { alertsEnabled, toggleAlerts };
};