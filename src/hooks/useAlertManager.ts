import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { parseISO, isAfter, isBefore } from "date-fns";
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

  // Use React Query to manage last alert time
  const { data: lastAlertTime = 0 } = useQuery({
    queryKey: ['lastAlertTime'],
    queryFn: () => Number(localStorage.getItem(LAST_ALERT_TIME_KEY)) || 0,
    staleTime: Infinity,
  });

  // Mutation to toggle alerts
  const toggleAlertsMutation = useMutation({
    mutationFn: (newState: boolean) => {
      localStorage.setItem(ALERTS_ENABLED_KEY, String(newState));
      if (!newState) {
        // Clear shown alerts when disabling
        localStorage.removeItem(SHOWN_ALERTS_KEY);
        localStorage.removeItem(LAST_ALERT_TIME_KEY);
        queryClient.setQueryData(['lastAlertTime'], 0);
      }
      return Promise.resolve(newState);
    },
    onSuccess: (newState) => {
      queryClient.setQueryData(['alertsEnabled'], newState);
      if (newState) {
        checkAndShowAlert();
      }
    },
  });

  const checkAndShowAlert = () => {
    if (!alertsEnabled) return;

    const now = new Date().getTime();
    const lastShown = Number(localStorage.getItem(LAST_ALERT_TIME_KEY)) || 0;
    
    // Only proceed if it's been 24 hours since the last alert
    if (now - lastShown < 24 * 60 * 60 * 1000) {
      return;
    }

    const today = new Date();
    // Get unique alerts for the current day only
    const todayAlerts = upcomingAlerts
      .filter(alert => {
        const alertDate = parseISO(`${alert.date}`);
        return isAfter(alertDate, today) && 
               isBefore(alertDate, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
      })
      .sort((a, b) => {
        const dateA = parseISO(`${a.date} ${a.time}`);
        const dateB = parseISO(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

    if (todayAlerts.length > 0) {
      const nextAlert = todayAlerts[0];
      
      localStorage.setItem(LAST_ALERT_TIME_KEY, String(now));
      queryClient.setQueryData(['lastAlertTime'], now);
      
      toast({
        title: "Upcoming Low Tide Near Sunrise/Sunset",
        description: `Next low tide on ${nextAlert.date} at ${nextAlert.time} coincides with ${nextAlert.type}`,
        duration: 5000,
      });
    }
  };

  const toggleAlerts = () => {
    toggleAlertsMutation.mutate(!alertsEnabled);
  };

  return { alertsEnabled, toggleAlerts };
};