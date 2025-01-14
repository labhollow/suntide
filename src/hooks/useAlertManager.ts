import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { parseISO, isAfter, isBefore } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const ALERTS_ENABLED_KEY = 'tideAlertsEnabled';
const LAST_ALERT_TIME_KEY = 'lastAlertTime';

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
    const now = new Date().getTime();
    const lastShown = Number(localStorage.getItem(LAST_ALERT_TIME_KEY)) || 0;
    
    // Only show alert if enabled and hasn't been shown in the last 24 hours
    if (alertsEnabled && (now - lastShown > 24 * 60 * 60 * 1000)) {
      const today = new Date();
      const futureAlerts = upcomingAlerts
        .map(alert => ({
          ...alert,
          fullDate: parseISO(`${alert.date} ${alert.time}`)
        }))
        .filter(alert => isAfter(alert.fullDate, today))
        .sort((a, b) => isBefore(a.fullDate, b.fullDate) ? -1 : 1);

      const nextAlert = futureAlerts[0];
      if (nextAlert) {
        localStorage.setItem(LAST_ALERT_TIME_KEY, String(now));
        queryClient.setQueryData(['lastAlertTime'], now);
        
        toast({
          title: "Upcoming Low Tide Near Sunrise/Sunset",
          description: `Next low tide on ${nextAlert.date} at ${nextAlert.time} coincides with ${nextAlert.type}`,
          duration: 5000,
        });
      }
    }
  };

  const toggleAlerts = () => {
    toggleAlertsMutation.mutate(!alertsEnabled);
  };

  return { alertsEnabled, toggleAlerts };
};