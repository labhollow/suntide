
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ArrowUp, ArrowDown, Waves, Sunrise, Sunset, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const TideDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tideData = location.state?.tideData;
  
  if (!tideData) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="text-blue-200 mb-6 hover:bg-blue-900/20"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tides
          </Button>
          <div className="p-8 text-center">
            <p className="text-white">No tide data available.</p>
          </div>
        </div>
      </div>
    );
  }
  
  const {
    date,
    type,
    height,
    sunrise,
    sunset,
    moonrise,
    moonset,
    moonPhase,
    isNearSunriseOrSunset,
    isNearSunrise,
    isNearMoonriseOrMoonset,
    isNearMoonrise
  } = tideData;

  const formattedDate = format(date, 'EEEE, MMMM dd, yyyy');
  const formattedTime = format(date, 'h:mm a');
  
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-850 to-slate-900">
        <div className="relative w-full min-h-screen">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RhcnMiIHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />
          
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 relative">
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                className="text-blue-200 hover:bg-blue-900/20"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tides
              </Button>
              
              <h1 className="text-2xl text-blue-200 flex items-center gap-3">
                <Waves className="h-6 w-6" />
                Tide Details
              </h1>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white">{formattedDate}</h2>
              <p className="text-gray-300">{formattedTime}</p>
            </div>
            
            <div className="space-y-6">
              {/* Main tide information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className={`backdrop-blur-sm border-white/10 transition-colors p-6 ${
                  isNearSunriseOrSunset 
                    ? 'bg-orange-500/20 border-orange-500/50' 
                    : isNearMoonriseOrMoonset 
                      ? 'bg-blue-500/20 border-blue-500/50' 
                      : 'bg-white/5'
                }`}>
                  <h3 className="text-xl font-semibold text-blue-200 mb-4 flex items-center gap-2">
                    <Waves className="w-5 h-5" />
                    Tide Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400">Type</p>
                      <p className="text-2xl font-semibold text-white capitalize flex items-center gap-2">
                        {type === 'H' ? (
                          <>
                            <ArrowUp className="w-5 h-5 text-blue-400" />
                            High Tide
                          </>
                        ) : (
                          <>
                            <ArrowDown className="w-5 h-5 text-blue-400" />
                            Low Tide
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Height</p>
                      <p className="text-2xl font-semibold text-white">{height.toFixed(2)} ft</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Time</p>
                      <p className="text-2xl font-semibold text-white">{formattedTime}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
                  <h3 className="text-xl font-semibold text-blue-200 mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-tide-sunrise" />
                    Sun Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Sunrise</p>
                        <p className={`text-lg font-semibold ${isNearSunrise ? "text-orange-400" : "text-white"}`}>
                          {sunrise || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Sunset</p>
                        <p className={`text-lg font-semibold ${isNearSunriseOrSunset && !isNearSunrise ? "text-orange-400" : "text-white"}`}>
                          {sunset || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {isNearSunriseOrSunset && (
                      <div className="mt-2 py-2 px-3 bg-orange-500/30 border border-orange-500/50 rounded-lg">
                        <p className="text-orange-300 text-sm">
                          {isNearSunrise ? 
                            "This tide is near sunrise! Great time for beach exploration." : 
                            "This tide is near sunset! Perfect for evening tide pools."}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Moon information */}
              <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
                <h3 className="text-xl font-semibold text-blue-200 mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-blue-200" />
                  Moon Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400">Moonrise</p>
                    <p className={`text-lg font-semibold ${isNearMoonrise ? "text-blue-400" : "text-white"}`}>
                      {moonrise || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Moonset</p>
                    <p className={`text-lg font-semibold ${isNearMoonriseOrMoonset && !isNearMoonrise ? "text-blue-400" : "text-white"}`}>
                      {moonset || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Moon Phase</p>
                    <p className="text-lg font-semibold text-white">{moonPhase}</p>
                  </div>
                </div>
                {isNearMoonriseOrMoonset && (
                  <div className="mt-4 py-2 px-3 bg-blue-500/30 border border-blue-500/50 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      {isNearMoonrise ? 
                        "This tide is near moonrise! Watch for stronger tidal effects." : 
                        "This tide is near moonset! Excellent time for observing marine life."}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TideDetail;