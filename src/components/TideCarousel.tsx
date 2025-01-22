import React, { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { AlertTriangle, Waves, ArrowRight, ArrowLeft } from 'lucide-react';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { isWithinHours } from "@/utils/dateUtils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface TideCarouselProps {
  tideData: any[];
  alertDuration: number;
}

const TideCarousel = ({ tideData, alertDuration }: TideCarouselProps) => {
  const now = new Date();

  const tidesWithContext = useMemo(() => {
    if (!tideData.length) return [];

    const currentTideIndex = tideData.findIndex((tide, index) => {
      const tideTime = parseISO(tide.t);
      const nextTideTime = tideData[index + 1] ? parseISO(tideData[index + 1].t) : null;
      return nextTideTime ? isBefore(now, nextTideTime) && isAfter(now, tideTime) : isAfter(now, tideTime);
    });

    return tideData.map((tide, index) => {
      const tideTime = parseISO(tide.t);
      let context = '';
      
      if (index === currentTideIndex) {
        context = 'Current Tide';
      } else if (index === currentTideIndex + 1) {
        context = 'Next Tide';
      } else if (index === currentTideIndex - 1) {
        context = 'Previous Tide';
      }

      const isAlert = tide.type === 'L' && (
        isWithinHours(format(tideTime, 'hh:mm a'), tide.sunrise, alertDuration) ||
        isWithinHours(format(tideTime, 'hh:mm a'), tide.sunset, alertDuration)
      );

      return { ...tide, context, isAlert };
    });
  }, [tideData, alertDuration]);

  if (!tidesWithContext.length) {
    return null;
  }

  return (
    <Carousel className="w-full relative">
      <CarouselContent>
        {tidesWithContext.map((tide, index) => (
          <CarouselItem key={index}>
            <Card className={`p-6 backdrop-blur-sm border-white/10 transition-colors ${
              tide.isAlert 
                ? 'bg-orange-500/20 border-orange-500/50' 
                : 'bg-white/5'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-200">
                  {tide.context || `${tide.type === 'H' ? 'High' : 'Low'} Tide ${index + 1}`}
                </h3>
                <div className="flex items-center gap-2">
                  {tide.isAlert && (
                    <AlertTriangle className="w-5 h-5 text-orange-400 animate-pulse" />
                  )}
                  <Waves className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-white">
                  {parseFloat(tide.v).toFixed(1)}ft
                </div>
                <div className="text-blue-200">
                  {format(parseISO(tide.t), 'h:mm a')}
                </div>
                {tide.isAlert && (
                  <div className="text-orange-400 text-sm">
                    Near {isWithinHours(format(parseISO(tide.t), 'hh:mm a'), tide.sunrise, alertDuration) ? 'Sunrise' : 'Sunset'}
                  </div>
                )}
              </div>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-0 -translate-x-1/2" />
      <CarouselNext className="absolute right-0 translate-x-1/2" />
    </Carousel>
  );
};

export default TideCarousel;